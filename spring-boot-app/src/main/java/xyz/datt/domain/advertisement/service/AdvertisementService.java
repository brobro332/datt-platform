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

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdvertisementService {
    private final AdvertisementRepository advertisementRepository;

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

    public List<AdResponse> getAllAdsForAdmin() {
        return advertisementRepository.findAllByOrderByIdDesc().stream()
                .map(AdResponse::from)
                .collect(Collectors.toList());
    }

    public List<AdResponse> getActiveAds() {
        return advertisementRepository.findAllByStatusOrderByIdDesc("ACTIVE").stream()
                .map(AdResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteAd(Long adId) {
        Advertisement ad = advertisementRepository.findById(adId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ADVERTISEMENT_NOT_FOUND));
        advertisementRepository.delete(ad);
    }
}
