package xyz.datt.domain.place.batch.config;

import org.springframework.batch.infrastructure.item.file.FlatFileItemReader;
import org.springframework.batch.infrastructure.item.file.MultiResourceItemReader;
import org.springframework.batch.infrastructure.item.file.mapping.BeanWrapperFieldSetMapper;
import org.springframework.batch.infrastructure.item.file.mapping.DefaultLineMapper;
import org.springframework.batch.infrastructure.item.file.transform.DelimitedLineTokenizer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;
import xyz.datt.domain.place.batch.client.PlacePublicDataClient;
import xyz.datt.domain.place.batch.dto.PlacePublicDataItem;
import xyz.datt.domain.place.batch.processor.PlaceItemProcessor;
import xyz.datt.domain.place.batch.reader.PlaceApiItemReader;
import xyz.datt.domain.place.batch.writer.PlaceItemWriter;
import xyz.datt.domain.place.repository.PlaceMasterRepository;

import java.io.IOException;
import java.io.UncheckedIOException;

@Configuration
public class PlaceBatchConfig {
    @Bean
    public PlaceApiItemReader placeApiItemReader(PlacePublicDataClient placePublicDataClient) {
        return new PlaceApiItemReader(placePublicDataClient);
    }

    @Bean
    public FlatFileItemReader<PlacePublicDataItem> placeFileItemReader(
        @Value("${app.batch.encoding:UTF-8}") String encoding
    ) {
        DefaultLineMapper<PlacePublicDataItem> lineMapper = new DefaultLineMapper<>();
        DelimitedLineTokenizer tokenizer = new DelimitedLineTokenizer();
        tokenizer.setDelimiter(DelimitedLineTokenizer.DELIMITER_COMMA);
        tokenizer.setNames(
            "bizesId", "bizesNm", "brchNm", "indsLclsCd", "indsLclsNm",
            "indsMclsCd", "indsMclsNm", "indsSclsCd", "indsSclsNm",
            "ksicCd", "ksicNm", "ctprvnCd", "ctprvnNm", "signguCd", "signguNm",
            "adongCd", "adongNm", "ldongCd", "ldongNm", "lnoCd", "plotSctCd", "plotSctNm",
            "lnoMnno", "lnoSlno", "lnoAdr", "rdnmCd", "rdnm", "bldMnno", "bldSlno",
            "bldMngNo", "bldNm", "rdnmAdr", "oldZipcd", "newZipcd", "dongNo", "flrNo", "hoNo",
            "lon", "lat"
        );

        BeanWrapperFieldSetMapper<PlacePublicDataItem> fieldSetMapper = new BeanWrapperFieldSetMapper<>();
        fieldSetMapper.setTargetType(PlacePublicDataItem.class);
        fieldSetMapper.setDistanceLimit(0);
        fieldSetMapper.setStrict(false);

        lineMapper.setLineTokenizer(tokenizer);
        lineMapper.setFieldSetMapper(fieldSetMapper);

        FlatFileItemReader<PlacePublicDataItem> reader = new FlatFileItemReader<PlacePublicDataItem>(lineMapper);
        reader.setLinesToSkip(1); // 헤더 라인 스킵
        reader.setEncoding(encoding);

        return reader;
    }

    @Bean
    public MultiResourceItemReader<PlacePublicDataItem> placeMultiResourceItemReader(
        @Value("${app.batch.file-pattern:uploads/소상공인시장진흥공단_상가(상권)정보_*.csv}") String filePattern,
        FlatFileItemReader<PlacePublicDataItem> placeFileItemReader
    ) {
        MultiResourceItemReader<PlacePublicDataItem> multiReader = new MultiResourceItemReader<PlacePublicDataItem>(placeFileItemReader);
        ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        try {
            Resource[] resources = resolver.getResources("file:" + filePattern);
            multiReader.setResources(resources);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        return multiReader;
    }

    @Bean
    public PlaceItemProcessor placeItemProcessor() {
        return new PlaceItemProcessor();
    }

    @Bean
    public PlaceItemWriter placeItemWriter(PlaceMasterRepository placeMasterRepository) {
        return new PlaceItemWriter(placeMasterRepository);
    }
}