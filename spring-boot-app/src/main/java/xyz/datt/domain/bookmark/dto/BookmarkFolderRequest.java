package xyz.datt.domain.bookmark.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BookmarkFolderRequest(
    @NotBlank(message = "폴더 이름은 필수입니다.")
    @Size(max = 50, message = "폴더 이름은 50자 이하로 입력해 주세요.")
    String name
) {}
