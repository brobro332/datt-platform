package xyz.datt.domain.advertisement.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.advertisement.dto.AdvertisementDto.AdCreateRequest;
import xyz.datt.domain.advertisement.dto.AdvertisementDto.AdResponse;
import xyz.datt.domain.advertisement.entity.Advertisement;
import xyz.datt.domain.advertisement.repository.AdvertisementRepository;
import xyz.datt.global.error.BusinessException;
import xyz.datt.global.error.ErrorCode;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 광고(Advertisement) 관련 비즈니스 로직을 처리하는 서비스 클래스입니다.
 * 광고의 생성, 조회 및 삭제 기능을 제공하며 관리자 기능과 일반 사용자 기능을 분리하여 처리합니다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdvertisementService {
    private final AdvertisementRepository advertisementRepository;

    /**
     * 새로운 광고를 생성합니다.
     * 기본 상태는 'ACTIVE'로 지정되어 저장됩니다.
     *
     * @param request 생성할 광고의 정보(제목, 이미지 URL, 연결 URL)를 담은 요청 객체
     * @return 생성된 광고 정보를 담은 응답 객체
     */
    @Transactional
    public AdResponse createAd(AdCreateRequest request) {
        Advertisement ad = Advertisement.builder()
                .title(request.title())
                .imageUrl(request.imageUrl())
                .linkUrl(request.linkUrl())
                .status("ACTIVE")
                .build();
        
        Advertisement savedAd = advertisementRepository.save(ad);
        return AdResponse.from(savedAd);
    }

    /**
     * 관리자를 위해 모든 광고 목록을 최신순으로 조회합니다.
     * 상태(ACTIVE, INACTIVE 등)에 상관없이 등록된 모든 광고를 반환합니다.
     *
     * @return 모든 광고의 응답 객체 리스트
     */
    public List<AdResponse> getAllAdsForAdmin() {
        return advertisementRepository.findAllByOrderByIdDesc().stream()
                .map(AdResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 일반 사용자를 위해 상태가 'ACTIVE'인 활성화된 광고 목록을 최신순으로 조회합니다.
     *
     * @return 활성 상태인 광고의 응답 객체 리스트
     */
    public List<AdResponse> getActiveAds() {
        return advertisementRepository.findAllByStatusOrderByIdDesc("ACTIVE").stream()
                .map(AdResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 지정된 ID의 광고를 데이터베이스에서 물리적으로 삭제합니다.
     *
     * @param adId 삭제할 광고의 ID
     * @throws BusinessException 해당 ID의 광고를 찾을 수 없는 경우 발생 (ADVERTISEMENT_NOT_FOUND)
     */
    @Transactional
    public void deleteAd(Long adId) {
        Advertisement ad = advertisementRepository.findById(adId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ADVERTISEMENT_NOT_FOUND));
        advertisementRepository.delete(ad);
    }
}
