package xyz.datt.domain.bookmark.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import xyz.datt.domain.member.entity.Member;
import xyz.datt.global.entity.BaseEntity;

@Getter
@Entity
@Table(
    name = "bookmark_folders",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_bookmark_folders_member_name",
            columnNames = {"member_id", "name"}
        )
    }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BookmarkFolder extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(nullable = false, length = 50)
    private String name;

    @Builder
    private BookmarkFolder(Member member, String name) {
        this.member = member;
        this.name = name;
    }

    public void updateName(String name) {
        this.name = name;
    }
}
