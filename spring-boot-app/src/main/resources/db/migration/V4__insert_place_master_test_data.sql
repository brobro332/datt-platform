INSERT INTO place_master (
    bizes_id,
    bizes_nm,
    brch_nm,

    inds_lcls_cd,
    inds_lcls_nm,

    inds_mcls_cd,
    inds_mcls_nm,

    inds_scls_cd,
    inds_scls_nm,

    ctprvn_nm,
    signgu_nm,
    adong_nm,
    ldong_nm,

    lno_adr,
    rdnm_adr,
    new_zipcd,

    lon,
    lat,
    location,

    created_at,
    updated_at
) VALUES (
    'TEST-001',
    '스타벅스 강남점',
    NULL,

    'I2',
    '음식',

    'I212',
    '카페',

    'I21201',
    '커피전문점/카페',

    '서울특별시',
    '강남구',
    '역삼동',
    '역삼동',

    '서울특별시 강남구 역삼동 123-1',
    '서울특별시 강남구 테헤란로 123',
    '06123',

    127.0276,
    37.4979,
    'POINT(127.0276 37.4979)',

    NOW(),
    NOW()
);

INSERT INTO place_master (
    bizes_id,
    bizes_nm,
    brch_nm,

    inds_lcls_cd,
    inds_lcls_nm,

    inds_mcls_cd,
    inds_mcls_nm,

    inds_scls_cd,
    inds_scls_nm,

    ctprvn_nm,
    signgu_nm,
    adong_nm,
    ldong_nm,

    lno_adr,
    rdnm_adr,
    new_zipcd,

    lon,
    lat,
    location,

    created_at,
    updated_at
) VALUES (
    'TEST-002',
    '메가커피 선릉점',
    NULL,

    'I2',
    '음식',

    'I212',
    '카페',

    'I21201',
    '커피전문점/카페',

    '서울특별시',
    '강남구',
    '대치동',
    '대치동',

    '서울특별시 강남구 대치동 456-7',
    '서울특별시 강남구 선릉로 456',
    '06124',

    127.0489,
    37.5045,
    'POINT(127.0489 37.5045)',

    NOW(),
    NOW()
);

-- 3. 맛집 (FOOD)
INSERT INTO place_master (
    bizes_id,
    bizes_nm,
    brch_nm,

    inds_lcls_cd,
    inds_lcls_nm,

    inds_mcls_cd,
    inds_mcls_nm,

    inds_scls_cd,
    inds_scls_nm,

    ctprvn_nm,
    signgu_nm,
    adong_nm,
    ldong_nm,

    lno_adr,
    rdnm_adr,
    new_zipcd,

    lon,
    lat,
    location,

    created_at,
    updated_at
) VALUES (
    'TEST-003',
    '강남한우마을',
    NULL,

    'I2',
    '음식',

    'I201',
    '한식',

    'I20101',
    '갈비/삼겹살',

    '서울특별시',
    '강남구',
    '역삼동',
    '역삼동',

    '서울특별시 강남구 역삼동 123-2',
    '서울특별시 강남구 테헤란로 125',
    '06123',

    127.0290,
    37.4985,
    'POINT(127.0290 37.4985)',

    NOW(),
    NOW()
);

-- 4. 술집 (BAR)
INSERT INTO place_master (
    bizes_id,
    bizes_nm,
    brch_nm,

    inds_lcls_cd,
    inds_lcls_nm,

    inds_mcls_cd,
    inds_mcls_nm,

    inds_scls_cd,
    inds_scls_nm,

    ctprvn_nm,
    signgu_nm,
    adong_nm,
    ldong_nm,

    lno_adr,
    rdnm_adr,
    new_zipcd,

    lon,
    lat,
    location,

    created_at,
    updated_at
) VALUES (
    'TEST-004',
    '강남맥주창고',
    NULL,

    'I2',
    '음식',

    'I208',
    '주점',

    'I20801',
    '맥주바/호프',

    '서울특별시',
    '강남구',
    '역삼동',
    '역삼동',

    '서울특별시 강남구 역삼동 123-3',
    '서울특별시 강남구 테헤란로 127',
    '06123',

    127.0310,
    37.4990,
    'POINT(127.0310 37.4990)',

    NOW(),
    NOW()
);

-- 5. 숙소 (STAY)
INSERT INTO place_master (
    bizes_id,
    bizes_nm,
    brch_nm,

    inds_lcls_cd,
    inds_lcls_nm,

    inds_mcls_cd,
    inds_mcls_nm,

    inds_scls_cd,
    inds_scls_nm,

    ctprvn_nm,
    signgu_nm,
    adong_nm,
    ldong_nm,

    lno_adr,
    rdnm_adr,
    new_zipcd,

    lon,
    lat,
    location,

    created_at,
    updated_at
) VALUES (
    'TEST-005',
    '강남그랜드호텔',
    NULL,

    'I1',
    '숙박',

    'I101',
    '일반숙박',

    'I10101',
    '호텔/콘도',

    '서울특별시',
    '강남구',
    '역삼동',
    '역삼동',

    '서울특별시 강남구 역삼동 123-4',
    '서울특별시 강남구 테헤란로 129',
    '06123',

    127.0330,
    37.4995,
    'POINT(127.0330 37.4995)',

    NOW(),
    NOW()
);

-- 6. 놀거리 (PLAY)
INSERT INTO place_master (
    bizes_id,
    bizes_nm,
    brch_nm,

    inds_lcls_cd,
    inds_lcls_nm,

    inds_mcls_cd,
    inds_mcls_nm,

    inds_scls_cd,
    inds_scls_nm,

    ctprvn_nm,
    signgu_nm,
    adong_nm,
    ldong_nm,

    lno_adr,
    rdnm_adr,
    new_zipcd,

    lon,
    lat,
    location,

    created_at,
    updated_at
) VALUES (
    'TEST-006',
    '강남VR존',
    NULL,

    'R1',
    '예술·스포츠',

    'R104',
    '유원지·오락',

    'R10401',
    '오락실',

    '서울특별시',
    '강남구',
    '역삼동',
    '역삼동',

    '서울특별시 강남구 역삼동 123-5',
    '서울특별시 강남구 테헤란로 131',
    '06123',

    127.0350,
    37.5000,
    'POINT(127.0350 37.5000)',

    NOW(),
    NOW()
);