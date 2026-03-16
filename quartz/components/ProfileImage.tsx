import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { i18n } from "../i18n"

const ProfileImage: QuartzComponent = ({ fileData, cfg, displayClass }: QuartzComponentProps) => {
  const profileImageDir = cfg?.profileImageDir ?? i18n(cfg.locale).propertyDefaults.title

  return (
    <div class={classNames(displayClass, "profile-image")}>
      <img src={`${profileImageDir}`} alt="Profile Image" />
    </div>
  )
}

ProfileImage.css = `
.profile-image {
  text-align: center;
  max-width: 100%; /* 부모 요소에 맞게 크기 제한 */
}

.profile-image img {
  width: 100%;         /* 부모 요소 너비에 맞춰 확장 */
  max-width: 220px;    /* 최대 크기 제한 */
  height: auto;        /* 비율 유지하며 높이 자동 조정 */
  border-radius: 10px; /* 사각형(라운드) */
  object-fit: cover;   /* 비율 유지하면서 잘림 */
  aspect-ratio: 1 / 1; /* 가로세로 비율 유지 */
}

@media (max-width: 800px) {
  .profile-image img {
    max-width: 180px;
  }
}
`

export default (() => ProfileImage) satisfies QuartzComponentConstructor
