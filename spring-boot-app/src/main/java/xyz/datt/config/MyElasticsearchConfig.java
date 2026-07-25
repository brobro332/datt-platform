package xyz.datt.config;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.json.jackson.JacksonJsonpMapper;
import co.elastic.clients.transport.ElasticsearchTransport;
import co.elastic.clients.transport.rest_client.RestClientTransport;
import org.apache.http.HttpHost;
import org.elasticsearch.client.RestClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;

@Configuration
public class MyElasticsearchConfig {

    @Bean
    public RestClient dattElasticsearchRestClient() {
        return RestClient.builder(
                new HttpHost("elasticsearch", 9200, "http")
        ).build();
    }

    @Bean
    public ElasticsearchTransport elasticsearchTransport(RestClient dattElasticsearchRestClient) {
        return new RestClientTransport(dattElasticsearchRestClient, new JacksonJsonpMapper());
    }

    @Bean
    public ElasticsearchClient elasticsearchClient(ElasticsearchTransport transport) {
        return new ElasticsearchClient(transport);
    }

    @Bean
    public ElasticsearchOperations elasticsearchTemplate(ElasticsearchClient client) {
        return new ElasticsearchTemplate(client);
    }
}
