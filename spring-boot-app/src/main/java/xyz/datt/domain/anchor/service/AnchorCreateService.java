package xyz.datt.domain.anchor.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.anchor.dto.AnchorCreateRequest;
import xyz.datt.domain.anchor.dto.AnchorDetailResponse;
import xyz.datt.domain.anchor.entity.Anchor;
import xyz.datt.domain.anchor.entity.AnchorPlaceCategory;
import xyz.datt.domain.anchor.repository.AnchorRepository;
import xyz.datt.domain.member.entity.Member;
import xyz.datt.domain.member.repository.MemberRepository;
import xyz.datt.domain.place.dto.PlaceNearbyResponse;
import xyz.datt.domain.place.entity.PlaceMaster;
import xyz.datt.domain.place.repository.PlaceMasterRepository;
import xyz.datt.global.error.BusinessException;
import xyz.datt.global.error.ErrorCode;

import java.util.List;
import java.util.Map;

import xyz.datt.domain.gamification.entity.ActivityType;
import xyz.datt.domain.gamification.service.GamificationService;

/**
 * 정박지(Anchor)의 생성 및 수정과 관련된 비즈니스 로직을 처리하는 서비스 클래스입니다.
 * 사용자 기반의 정박지 생성과 주변 장소 추천, 게임화 요소(경험치 등) 로그 기록을 포함합니다.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class AnchorCreateService {
    private static final double DEFAULT_RADIUS_KM = 3.0;

    private final AnchorRepository anchorRepository;
    private final MemberRepository memberRepository;
    private final PlaceMasterRepository placeMasterRepository;
    private final AnchorRecommendationService anchorRecommendationService;
    private final AnchorPlaceCreateService anchorPlaceCreateService;
    private final AnchorDetailService anchorDetailService;
    private final GamificationService gamificationService;

    /**
     * 새로운 정박지를 생성합니다.
     * <p>
     * 사용자의 유효성을 확인하고, 좌표 및 반경에 대한 검증을 거친 후 정박지를 저장합니다.
     * 요청에 특정 장소 ID들이 포함되어 있다면 해당 장소들을 직접 정박지 주변 장소로 등록하며,
     * 그렇지 않을 경우 반경 내 장소들을 카테고리별로 추천받아 자동으로 등록합니다.
     * 마지막으로 정박지 생성에 대한 게임화 활동 로그를 기록합니다.
     * </p>
     *
     * @param memberId 정박지를 생성하는 회원의 ID
     * @param request 정박지 생성에 필요한 정보(제목, 기준 장소명, 주소, 좌표, 반경 등)를 담은 요청 객체
     * @return 생성된 정박지의 상세 정보를 담은 응답 객체
     * @throws BusinessException 회원 정보가 없거나, 잘못된 좌표/반경일 경우 발생
     */
    public AnchorDetailResponse createAnchor(
        Long memberId,
        AnchorCreateRequest request
    ) {
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        AnchorBaseInfo baseInfo = resolveBaseInfo(request);
        validateCoordinate(baseInfo.baseLat(), baseInfo.baseLon());

        double radiusKm = request.radiusKm() == null
            ? DEFAULT_RADIUS_KM
            : request.radiusKm();

        validateRadius(radiusKm);

        Anchor anchor = Anchor.builder()
            .member(member)
            .title(request.title())
            .basePlaceName(baseInfo.basePlaceName())
            .baseAddress(baseInfo.baseAddress())
            .baseLon(baseInfo.baseLon())
            .baseLat(baseInfo.baseLat())
            .radiusKm(radiusKm)
            .isPublic(Boolean.TRUE.equals(request.isPublic()))
            .build();

        Anchor savedAnchor = anchorRepository.save(anchor);

        if (request.placeIds() != null && !request.placeIds().isEmpty()) {
            anchorPlaceCreateService.createCustomAnchorPlaces(savedAnchor, request.placeIds());
        } else {
            Map<AnchorPlaceCategory, List<PlaceNearbyResponse>> recommendations =
                anchorRecommendationService.recommendByCategory(
                    savedAnchor.getBaseLat(),
                    savedAnchor.getBaseLon(),
                    savedAnchor.getRadiusKm()
                );

            anchorPlaceCreateService.createAnchorPlaces(savedAnchor, recommendations);
        }

        gamificationService.logActivity(memberId, ActivityType.ANCHOR_CREATE, "정박지 '" + savedAnchor.getTitle() + "' 생성");

        return anchorDetailService.getAnchorDetail(memberId, savedAnchor.getId());
    }

    /**
     * 기존 정박지에 포함된 장소 목록을 수정합니다.
     * <p>
     * 정박지의 소유주인지 권한을 검증한 후, 기존 장소 목록을 삭제하고 전달된 장소 ID 목록으로 대체합니다.
     * </p>
     *
     * @param memberId 수정을 요청한 회원의 ID
     * @param anchorId 수정할 정박지의 ID
     * @param placeIds 새로 등록할 장소들의 ID 리스트
     * @return 수정된 정박지의 상세 정보를 담은 응답 객체
     * @throws BusinessException 정박지가 없거나 권한이 없는 경우 발생
     */
    public AnchorDetailResponse updateAnchor(
        Long memberId,
        Long anchorId,
        List<Long> placeIds
    ) {
        Anchor anchor = anchorRepository.findById(anchorId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ANCHOR_NOT_FOUND));

        if (!anchor.getMember().getId().equals(memberId)) {
            throw new BusinessException(ErrorCode.ANCHOR_ACCESS_DENIED);
        }

        anchorPlaceCreateService.updateAnchorPlaces(anchor, placeIds);

        return anchorDetailService.getAnchorDetail(memberId, anchor.getId());
    }

    private AnchorBaseInfo resolveBaseInfo(AnchorCreateRequest request) {
        return new AnchorBaseInfo(
            request.basePlaceName(),
            request.baseAddress(),
            request.baseLon(),
            request.baseLat()
        );
    }

    private void validateCoordinate(Double lat, Double lon) {
        if (lat == null || lon == null) {
            throw new BusinessException(ErrorCode.PLACE_INVALID_SEARCH_CONDITION);
        }

        if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            throw new BusinessException(ErrorCode.PLACE_INVALID_COORDINATE);
        }
    }

    private void validateRadius(double radiusKm) {
        if (radiusKm <= 0) {
            throw new BusinessException(ErrorCode.PLACE_INVALID_SEARCH_CONDITION);
        }
    }

    private record AnchorBaseInfo(
        String basePlaceName,
        String baseAddress,
        Double baseLon,
        Double baseLat
    ) {
    }
}