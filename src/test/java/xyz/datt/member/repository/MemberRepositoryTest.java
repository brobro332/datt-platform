package xyz.datt.member.repository;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.member.entity.Member;

import static org.assertj.core.api.Assertions.assertThat;

@Transactional
@ActiveProfiles("test")
@SpringBootTest
class MemberRepositoryTest {
    @Autowired
    private MemberRepository memberRepository;

    @Test
    @DisplayName("회원을 저장하면 ID가 생성된다.")
    void givenMember_whenSave_thenPersistMember() {
        Member member = Member.createUser(
            "test@datt.xyz",
            "encoded-password",
            "테스터"
        );

        Member savedMember = memberRepository.save(member);

        assertThat(savedMember.getId()).isNotNull();
        assertThat(savedMember.getEmail()).isEqualTo("test@datt.xyz");
        assertThat(savedMember.getNickname()).isEqualTo("테스터");
    }
}