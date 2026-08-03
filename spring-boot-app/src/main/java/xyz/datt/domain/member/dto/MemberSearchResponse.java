package xyz.datt.domain.member.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import xyz.datt.domain.member.entity.Member;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MemberSearchResponse {
    private String nickname;
    private String email;

    public static MemberSearchResponse from(Member member) {
        return new MemberSearchResponse(member.getNickname(), member.getEmail());
    }
}
