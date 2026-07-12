package xyz.datt.domain.bookmark.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import xyz.datt.domain.member.entity.Member;
import xyz.datt.domain.place.entity.PlaceMaster;
import xyz.datt.global.entity.BaseEntity;

import java.util.ArrayList;
import java.util.List;

@Getter
@Entity
@Table(
    name = "place_bookmarks",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_place_bookmark_member_place",
            columnNames = {"member_id", "place_id"}
        )
    }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PlaceBookmark extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "place_id", nullable = false)
    private PlaceMaster placeMaster;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "bookmark_folder_places",
        joinColumns = @JoinColumn(name = "bookmark_id"),
        inverseJoinColumns = @JoinColumn(name = "folder_id")
    )
    private List<BookmarkFolder> bookmarkFolders = new ArrayList<>();

    @Builder
    private PlaceBookmark(Member member, PlaceMaster placeMaster, List<BookmarkFolder> bookmarkFolders) {
        this.member = member;
        this.placeMaster = placeMaster;
        this.bookmarkFolders = bookmarkFolders != null ? bookmarkFolders : new ArrayList<>();
    }

    public void updateFolders(List<BookmarkFolder> bookmarkFolders) {
        this.bookmarkFolders.clear();
        if (bookmarkFolders != null) {
            this.bookmarkFolders.addAll(bookmarkFolders);
        }
    }
}