package xyz.datt.domain.gamification.policy;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class LevelPolicyTest {
    @Test
    @DisplayName("경험치 기준으로 레벨을 계산한다.")
    void givenExp_whenCalculateLevel_thenReturnLevel() {
        assertThat(LevelPolicy.calculateLevel(0)).isEqualTo(1);
        assertThat(LevelPolicy.calculateLevel(499)).isEqualTo(1);
        assertThat(LevelPolicy.calculateLevel(500)).isEqualTo(2);
        assertThat(LevelPolicy.calculateLevel(1250)).isEqualTo(3);
    }

    @Test
    @DisplayName("다음 레벨 필요 경험치를 계산한다.")
    void givenLevel_whenGetRequiredExpForNextLevel_thenReturnExp() {
        assertThat(LevelPolicy.getRequiredExpForNextLevel(1)).isEqualTo(500);
        assertThat(LevelPolicy.getRequiredExpForNextLevel(2)).isEqualTo(1000);
        assertThat(LevelPolicy.getRequiredExpForNextLevel(5)).isEqualTo(2500);
    }
}