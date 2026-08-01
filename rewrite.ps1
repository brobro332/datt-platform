git checkout 6fd79e2
git commit --amend -m "fix: 서비스 문의 페이지 레이아웃 적용 및 알림 갱신 주기 단축"
git cherry-pick 6ad408f
git commit --amend -m "fix: 프로필 레이아웃 및 서비스 문의 UI 디자인 개선"
git cherry-pick 6560d67
git commit --amend -m "fix: 서비스 문의 UI 헤더 레이아웃 수정 및 프로필 카드 높이 조정"
git cherry-pick a7d4e13
git commit --amend -m "fix: 서비스 문의 UI 헤더 개선 및 프로필 카드 높이 통일"
git branch -f main HEAD
git checkout main
git push -f origin main
