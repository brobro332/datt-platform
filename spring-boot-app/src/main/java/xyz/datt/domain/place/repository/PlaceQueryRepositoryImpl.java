package xyz.datt.domain.place.repository;

import com.querydsl.core.types.ExpressionUtils;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.CaseBuilder;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.NumberExpression;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.SliceImpl;
import org.springframework.data.support.PageableExecutionUtils;
import xyz.datt.domain.anchor.entity.AnchorPlaceCategory;
import xyz.datt.domain.place.dto.PlaceNearbyCondition;
import xyz.datt.domain.place.dto.PlaceNearbyResponse;
import xyz.datt.domain.place.dto.PlaceSearchCondition;
import xyz.datt.domain.place.dto.PlaceSearchResponse;
import xyz.datt.domain.place.entity.PlaceMaster;
import xyz.datt.domain.place.entity.PlaceSortType;

import java.util.List;

import static xyz.datt.domain.place.entity.QPlaceMaster.placeMaster;
import static xyz.datt.domain.review.entity.QPlaceReview.placeReview;

@RequiredArgsConstructor
public class PlaceQueryRepositoryImpl implements PlaceQueryRepository {
    private final JPAQueryFactory queryFactory;

    @Override
    public Slice<PlaceMaster> searchPlaceMasters(PlaceSearchCondition condition, Pageable pageable) {
        List<PlaceMaster> content = queryFactory
            .selectFrom(placeMaster)
            .where(
                keywordContains(condition.getKeyword()),
                ctprvnNmEq(condition.getCtprvnNm()),
                signguNmEq(condition.getSignguNm()),
                adongNmEq(condition.getAdongNm()),
                indsMclsCdEq(condition.getIndsMclsCd()),
                categoryIn(condition.getCategory())
            )
            .orderBy(placeMaster.id.desc())
            .offset(pageable.getOffset())
            .limit(pageable.getPageSize() + 1)
            .fetch();
 
        boolean hasNext = false;
        if (content.size() > pageable.getPageSize()) {
            content.remove(pageable.getPageSize());
            hasNext = true;
        }
 
        return new SliceImpl<>(content, pageable, hasNext);
    }

    @Override
    public Page<PlaceSearchResponse> searchPlaces(
        PlaceSearchCondition condition,
        Pageable pageable
    ) {
        List<PlaceSearchResponse> responses = queryFactory
            .select(Projections.constructor(
                PlaceSearchResponse.class,
                placeMaster.id,
                placeMaster.bizesNm,
                placeMaster.brchNm,
                placeMaster.indsMclsCd,
                placeMaster.indsMclsNm,
                placeMaster.ctprvnNm,
                placeMaster.signguNm,
                placeMaster.adongNm,
                placeMaster.rdnmAdr,
                placeMaster.lon,
                placeMaster.lat,
                placeReview.rating.avg().coalesce(0.0),
                placeReview.count(),
                latestReviewImageExpression()
            ))
            .from(placeMaster)
            .leftJoin(placeReview).on(placeReview.placeMaster.eq(placeMaster))
            .where(
                keywordContains(condition.getKeyword()),
                ctprvnNmEq(condition.getCtprvnNm()),
                signguNmEq(condition.getSignguNm()),
                adongNmEq(condition.getAdongNm()),
                indsMclsCdEq(condition.getIndsMclsCd()),
                categoryIn(condition.getCategory())
            )
            .groupBy(placeMaster.id)
            .orderBy(orderBy(condition.getSortType()))
            .offset(pageable.getOffset())
            .limit(pageable.getPageSize())
            .fetch();

        return PageableExecutionUtils.getPage(
            responses,
            pageable,
            () -> {
                Long count = queryFactory
                    .select(placeMaster.count())
                    .from(placeMaster)
                    .where(
                        keywordContains(condition.getKeyword()),
                        ctprvnNmEq(condition.getCtprvnNm()),
                        signguNmEq(condition.getSignguNm()),
                        adongNmEq(condition.getAdongNm()),
                        indsMclsCdEq(condition.getIndsMclsCd()),
                        categoryIn(condition.getCategory())
                    )
                    .fetchOne();

                return count == null ? 0L : count;
            }
        );
    }

    @Override
    public Page<PlaceNearbyResponse> searchNearbyPlaces(
        PlaceNearbyCondition condition,
        Pageable pageable
    ) {
        NumberExpression<Double> distanceExpression = distanceExpression(
            condition.getLat(),
            condition.getLon()
        );

        List<PlaceNearbyResponse> content = queryFactory
            .select(Projections.constructor(
                PlaceNearbyResponse.class,
                placeMaster.id,
                placeMaster.bizesNm,
                placeMaster.brchNm,
                placeMaster.indsMclsCd,
                placeMaster.indsMclsNm,
                placeMaster.ctprvnNm,
                placeMaster.signguNm,
                placeMaster.adongNm,
                placeMaster.rdnmAdr,
                placeMaster.lon,
                placeMaster.lat,
                distanceExpression,
                placeReview.rating.avg().coalesce(0.0),
                placeReview.count(),
                latestReviewImageExpression()
            ))
            .from(placeMaster)
            .leftJoin(placeReview).on(placeReview.placeMaster.eq(placeMaster))
            .where(
                placeMaster.lon.isNotNull(),
                placeMaster.lat.isNotNull(),
                withinRadius(distanceExpression, condition.getRadiusKm()),
                keywordContains(condition.getKeyword()),
                indsMclsCdEq(condition.getIndsMclsCd()),
                categoryIn(condition.getCategory())
            )
            .groupBy(placeMaster.id)
            .orderBy(orderByDistance(distanceExpression))
            .offset(pageable.getOffset())
            .limit(pageable.getPageSize())
            .fetch();

        Long count = queryFactory
            .select(placeMaster.count())
            .from(placeMaster)
            .where(
                placeMaster.lon.isNotNull(),
                placeMaster.lat.isNotNull(),
                withinRadius(distanceExpression, condition.getRadiusKm()),
                keywordContains(condition.getKeyword()),
                indsMclsCdEq(condition.getIndsMclsCd()),
                categoryIn(condition.getCategory())
            )
            .fetchOne();

        return PageableExecutionUtils.getPage(
            content,
            pageable,
            () -> count == null ? 0L : count
        );
    }

    @Override
    public List<PlaceNearbyResponse> findNearbyPlacesForAnchor(
        Double baseLat,
        Double baseLon,
        Double radiusKm,
        List<String> indsMclsCodes,
        int limit
    ) {
        NumberExpression<Double> distanceExpression = distanceExpression(
            baseLat,
            baseLon
        );

        NumberExpression<Double> avgRating = placeReview.rating.avg().coalesce(0.0);
        NumberExpression<Integer> hasImage = new CaseBuilder()
            .when(placeReview.imageUrl.count().gt(0L)).then(1)
            .otherwise(0);

        return queryFactory
            .select(Projections.constructor(
                PlaceNearbyResponse.class,
                placeMaster.id,
                placeMaster.bizesNm,
                placeMaster.brchNm,
                placeMaster.indsMclsCd,
                placeMaster.indsMclsNm,
                placeMaster.ctprvnNm,
                placeMaster.signguNm,
                placeMaster.adongNm,
                placeMaster.rdnmAdr,
                placeMaster.lon,
                placeMaster.lat,
                distanceExpression,
                avgRating,
                placeReview.count(),
                latestReviewImageExpression()
            ))
            .from(placeMaster)
            .leftJoin(placeReview).on(placeReview.placeMaster.eq(placeMaster))
            .where(
                placeMaster.lon.isNotNull(),
                placeMaster.lat.isNotNull(),
                withinRadius(distanceExpression, radiusKm),
                placeMaster.indsMclsCd.in(indsMclsCodes)
            )
            .groupBy(placeMaster.id)
            .orderBy(hasImage.desc(), avgRating.desc(), distanceExpression.asc())
            .limit(limit)
            .fetch();
    }

    @Override
    public List<String> findUniqueProvinces() {
        return queryFactory
            .select(placeMaster.ctprvnNm)
            .from(placeMaster)
            .distinct()
            .where(placeMaster.ctprvnNm.isNotNull())
            .orderBy(placeMaster.ctprvnNm.asc())
            .fetch();
    }

    @Override
    public List<String> findUniqueDistricts(String province) {
        return queryFactory
            .select(placeMaster.signguNm)
            .from(placeMaster)
            .distinct()
            .where(
                placeMaster.ctprvnNm.eq(province),
                placeMaster.signguNm.isNotNull()
            )
            .orderBy(placeMaster.signguNm.asc())
            .fetch();
    }

    @Override
    public Double[] findRegionCenter(String province, String district) {
        com.querydsl.core.Tuple tuple = queryFactory
            .select(placeMaster.lat.avg(), placeMaster.lon.avg())
            .from(placeMaster)
            .where(
                placeMaster.ctprvnNm.eq(province),
                placeMaster.signguNm.eq(district),
                placeMaster.lat.isNotNull(),
                placeMaster.lon.isNotNull()
            )
            .fetchOne();

        if (tuple == null) {
            return new Double[]{0.0, 0.0};
        }

        return new Double[]{
            tuple.get(placeMaster.lat.avg()),
            tuple.get(placeMaster.lon.avg())
        };
    }

    @Override
    public List<PlaceNearbyResponse> findTopPlacesInRegion(
        String province,
        String district,
        List<String> indsMclsCodes,
        int limit
    ) {
        NumberExpression<Double> avgRating = placeReview.rating.avg().coalesce(0.0);
        NumberExpression<Integer> hasImage = new CaseBuilder()
            .when(placeReview.imageUrl.count().gt(0L)).then(1)
            .otherwise(0);

        return queryFactory
            .select(Projections.constructor(
                PlaceNearbyResponse.class,
                placeMaster.id,
                placeMaster.bizesNm,
                placeMaster.brchNm,
                placeMaster.indsMclsCd,
                placeMaster.indsMclsNm,
                placeMaster.ctprvnNm,
                placeMaster.signguNm,
                placeMaster.adongNm,
                placeMaster.rdnmAdr,
                placeMaster.lon,
                placeMaster.lat,
                Expressions.asNumber(0.0), // distance is 0 as we're region-based
                avgRating,
                placeReview.count(),
                latestReviewImageExpression()
            ))
            .from(placeMaster)
            .leftJoin(placeReview).on(placeReview.placeMaster.eq(placeMaster))
            .where(
                placeMaster.ctprvnNm.eq(province),
                placeMaster.signguNm.eq(district),
                placeMaster.indsMclsCd.in(indsMclsCodes)
            )
            .groupBy(placeMaster.id)
            .orderBy(hasImage.desc(), avgRating.desc(), placeMaster.bizesNm.asc())
            .limit(limit)
            .fetch();
    }

    private BooleanExpression keywordContains(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return null;
        }

        return placeMaster.bizesNm.containsIgnoreCase(keyword)
                .or(placeMaster.brchNm.containsIgnoreCase(keyword));
    }

    private BooleanExpression ctprvnNmEq(String ctprvnNm) {
        if (ctprvnNm == null || ctprvnNm.isBlank()) {
            return null;
        }

        return placeMaster.ctprvnNm.eq(ctprvnNm);
    }

    private BooleanExpression signguNmEq(String signguNm) {
        if (signguNm == null || signguNm.isBlank()) {
            return null;
        }

        return placeMaster.signguNm.eq(signguNm);
    }

    private BooleanExpression adongNmEq(String adongNm) {
        if (adongNm == null || adongNm.isBlank()) {
            return null;
        }

        return placeMaster.adongNm.eq(adongNm);
    }

    private BooleanExpression indsMclsCdEq(String indsMclsCd) {
        if (indsMclsCd == null || indsMclsCd.isBlank()) {
            return null;
        }

        return placeMaster.indsMclsCd.eq(indsMclsCd);
    }

    private BooleanExpression categoryIn(String category) {
        if (category == null || category.isBlank()) {
            return null;
        }
        try {
            AnchorPlaceCategory enumCategory = AnchorPlaceCategory.valueOf(category.toUpperCase());
            return placeMaster.indsMclsCd.in(enumCategory.getMiddleCategoryCodes());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private OrderSpecifier<?> orderBy(PlaceSortType sortType) {
        return switch (sortType) {
            case NAME -> placeMaster.bizesNm.asc();
            case LATEST -> placeMaster.createdAt.desc();
            case REVIEW_COUNT -> placeReview.count().desc();
            case RATING -> placeReview.rating.avg().coalesce(0.0).desc();
        };
    }

    private NumberExpression<Double> distanceExpression(
        Double baseLat,
        Double baseLon
    ) {
        return Expressions.numberTemplate(
            Double.class,
            """
            (6371 * acos(
                cos(radians({0})) * cos(radians({1})) *
                cos(radians({2}) - radians({3})) +
                sin(radians({0})) * sin(radians({1}))
            ))
            """,
            baseLat,
            placeMaster.lat,
            placeMaster.lon,
            baseLon
        );
    }

    private BooleanExpression withinRadius(
        NumberExpression<Double> distanceExpression,
        Double radiusKm
    ) {
        if (radiusKm == null) {
            return null;
        }

        return distanceExpression.loe(radiusKm);
    }

    private OrderSpecifier<Double> orderByDistance(
        NumberExpression<Double> distanceExpression
    ) {
        return distanceExpression.asc();
    }

    private com.querydsl.core.types.Expression<String> latestReviewImageExpression() {
        xyz.datt.domain.review.entity.QPlaceReview subReview = new xyz.datt.domain.review.entity.QPlaceReview("subReview");
        return ExpressionUtils.as(
            JPAExpressions.select(subReview.imageUrl)
                .from(subReview)
                .where(subReview.placeMaster.eq(placeMaster)
                    .and(subReview.imageUrl.isNotNull())
                    .and(subReview.imageUrl.ne("")))
                .orderBy(subReview.id.desc())
                .limit(1),
            "thumbnailUrl"
        );
    }
}