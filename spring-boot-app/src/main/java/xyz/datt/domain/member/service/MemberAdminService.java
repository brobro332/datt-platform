package xyz.datt.domain.member.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.member.dto.MemberAdminResponse;
import xyz.datt.domain.member.entity.Member;
import xyz.datt.domain.member.repository.MemberRepository;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberAdminService {
    private final MemberRepository memberRepository;

    public Page<MemberAdminResponse> getAllMembers(Pageable pageable) {
        return memberRepository.findAll(pageable)
            .map(MemberAdminResponse::from);
    }
}
