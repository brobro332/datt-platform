package xyz.datt.domain.admin.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import xyz.datt.global.entity.BaseEntity;

@Getter
@Entity
@Table(name = "admin_activity_log")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AdminActivityLog extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String adminEmail;

    @Column(nullable = false, length = 50)
    private String adminNickname;

    @Column(nullable = false, length = 50)
    private String actionType; // CREATE_PLACE, CREATE_AD, DELETE_AD

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false, length = 50)
    private String ipAddress;

    @Builder
    private AdminActivityLog(String adminEmail, String adminNickname, String actionType, String description, String ipAddress) {
        this.adminEmail = adminEmail;
        this.adminNickname = adminNickname;
        this.actionType = actionType != null ? actionType : "UNKNOWN";
        this.description = description;
        this.ipAddress = ipAddress;
    }
}
