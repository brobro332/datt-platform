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

        Map<AnchorPlaceCategory, List<PlaceNearbyResponse>> recommendations =
            anchorRecommendationService.recommendByCategory(
                savedAnchor.getBaseLat(),
                savedAnchor.getBaseLon(),
                savedAnchor.getRadiusKm()
            );

        anchorPlaceCreateService.createAnchorPlaces(savedAnchor, recommendations);

        gamificationService.logActivity(memberId, ActivityType.ANCHOR_CREATE, "정박지 '" + savedAnchor.getTitle() + "' 생성");

        return anchorDetailService.getAnchorDetail(memberId, savedAnchor.getId());
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