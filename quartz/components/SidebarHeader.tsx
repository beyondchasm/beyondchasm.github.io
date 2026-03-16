import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { i18n } from "../i18n"
import { pathToRoot } from "../util/path"

// @ts-ignore
import searchScript from "./scripts/search.inline"
import searchStyle from "./styles/search.scss"

// @ts-ignore
import darkmodeScript from "./scripts/darkmode.inline"
import darkmodeStyle from "./styles/darkmode.scss"

const SidebarHeader: QuartzComponent = ({ displayClass, cfg, fileData }: QuartzComponentProps) => {
  const homeDir = pathToRoot(fileData.slug!)
  const profileImageSrc = cfg?.profileImageDir ?? i18n(cfg.locale).propertyDefaults.title

  const searchTitle = i18n(cfg.locale).components.search.title
  const searchPlaceholder = i18n(cfg.locale).components.search.searchBarPlaceholder

  return (
    <div class={classNames(displayClass, "sidebar-header")}>
      <button
        type="button"
        class="sidebar-hamburger"
        id="mobile-explorer-proxy"
        aria-label="Menu"
        title="Menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-menu"
        >
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      </button>

      <a class="sidebar-logo" href={homeDir} aria-label={cfg.pageTitle}>
        <img src={profileImageSrc} alt="Profile Image" />
      </a>

      <div class="sidebar-actions">
        <div class="search">
          <button
            class="search-button"
            id="search-button"
            aria-label={searchTitle}
            title={searchTitle}
          >
            <svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19.9 19.7">
              <title>Search</title>
              <g class="search-path" fill="none">
                <path stroke-linecap="square" d="M18.5 18.3l-5.4-5.4" />
                <circle cx="8" cy="8" r="7" />
              </g>
            </svg>
          </button>
          <div id="search-container">
            <button type="button" id="search-close" aria-label="Close search" title="Close search">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div id="search-space">
              <input
                autocomplete="off"
                id="search-bar"
                name="search"
                type="text"
                aria-label={searchPlaceholder}
                placeholder={searchPlaceholder}
              />
              <div id="search-layout" data-preview={true}></div>
            </div>
          </div>
        </div>

        <button class="darkmode" id="darkmode">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            version="1.1"
            id="dayIcon"
            x="0px"
            y="0px"
            viewBox="0 0 35 35"
            style="enable-background:new 0 0 35 35"
            xmlSpace="preserve"
            aria-label={i18n(cfg.locale).components.themeToggle.darkMode}
          >
            <title>{i18n(cfg.locale).components.themeToggle.darkMode}</title>
            <path d="M6,17.5C6,16.672,5.328,16,4.5,16h-3C0.672,16,0,16.672,0,17.5    S0.672,19,1.5,19h3C5.328,19,6,18.328,6,17.5z M7.5,26c-0.414,0-0.789,0.168-1.061,0.439l-2,2C4.168,28.711,4,29.086,4,29.5    C4,30.328,4.671,31,5.5,31c0.414,0,0.789-0.168,1.06-0.44l2-2C8.832,28.289,9,27.914,9,27.5C9,26.672,8.329,26,7.5,26z M17.5,6    C18.329,6,19,5.328,19,4.5v-3C19,0.672,18.329,0,17.5,0S16,0.672,16,1.5v3C16,5.328,16.671,6,17.5,6z M27.5,9    c0.414,0,0.789-0.168,1.06-0.439l2-2C30.832,6.289,31,5.914,31,5.5C31,4.672,30.329,4,29.5,4c-0.414,0-0.789,0.168-1.061,0.44    l-2,2C26.168,6.711,26,7.086,26,7.5C26,8.328,26.671,9,27.5,9z M6.439,8.561C6.711,8.832,7.086,9,7.5,9C8.328,9,9,8.328,9,7.5    c0-0.414-0.168-0.789-0.439-1.061l-2-2C6.289,4.168,5.914,4,5.5,4C4.672,4,4,4.672,4,5.5c0,0.414,0.168,0.789,0.439,1.06    L6.439,8.561z M33.5,16h-3c-0.828,0-1.5,0.672-1.5,1.5s0.672,1.5,1.5,1.5h3c0.828,0,1.5-0.672,1.5-1.5S34.328,16,33.5,16z     M28.561,26.439C28.289,26.168,27.914,26,27.5,26c-0.828,0-1.5,0.672-1.5,1.5c0,0.414,0.168,0.789,0.439,1.06l2,2    C28.711,30.832,29.086,31,29.5,31c0.828,0,1.5-0.672,1.5-1.5c0-0.414-0.168-0.789-0.439-1.061L28.561,26.439z M17.5,29    c-0.829,0-1.5,0.672-1.5,1.5v3c0,0.828,0.671,1.5,1.5,1.5s1.5-0.672,1.5-1.5v-3C19,29.672,18.329,29,17.5,29z M17.5,7    C11.71,7,7,11.71,7,17.5S11.71,28,17.5,28S28,23.29,28,17.5S23.29,7,17.5,7z M17.5,25c-4.136,0-7.5-3.364-7.5-7.5    c0-4.136,3.364-7.5,7.5-7.5c4.136,0,7.5,3.364,7.5,7.5C25,21.636,21.636,25,17.5,25z"></path>
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            version="1.1"
            id="nightIcon"
            x="0px"
            y="0px"
            viewBox="0 0 100 100"
            style="enable-background:new 0 0 100 100"
            xmlSpace="preserve"
            aria-label={i18n(cfg.locale).components.themeToggle.lightMode}
          >
            <title>{i18n(cfg.locale).components.themeToggle.lightMode}</title>
            <path d="M96.76,66.458c-0.853-0.852-2.15-1.064-3.23-0.534c-6.063,2.991-12.858,4.571-19.655,4.571  C62.022,70.495,50.88,65.88,42.5,57.5C29.043,44.043,25.658,23.536,34.076,6.47c0.532-1.08,0.318-2.379-0.534-3.23  c-0.851-0.852-2.15-1.064-3.23-0.534c-4.918,2.427-9.375,5.619-13.246,9.491c-9.447,9.447-14.65,22.008-14.65,35.369  c0,13.36,5.203,25.921,14.65,35.368s22.008,14.65,35.368,14.65c13.361,0,25.921-5.203,35.369-14.65  c3.872-3.871,7.064-8.328,9.491-13.246C97.826,68.608,97.611,67.309,96.76,66.458z"></path>
          </svg>
        </button>
      </div>
    </div>
  )
}

SidebarHeader.beforeDOMLoaded = darkmodeScript
SidebarHeader.afterDOMLoaded = `
${searchScript}

document.addEventListener("nav", () => {
  const proxy = document.getElementById("mobile-explorer-proxy")
  const onClick = () => document.getElementById("mobile-explorer")?.click()
  proxy?.addEventListener("click", onClick)
  window.addCleanup?.(() => proxy?.removeEventListener("click", onClick))
})
`
SidebarHeader.css = `
${searchStyle}
${darkmodeStyle}

.sidebar-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.sidebar-header #search-close {
  display: none;
}

.sidebar-header .search #search-container.active #search-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 10px;
  background: var(--light);
  border: 1px solid var(--lightgray);
  cursor: pointer;
  color: var(--darkgray);
}

.sidebar-header .sidebar-hamburger {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: var(--darkgray);
}

.sidebar-header .sidebar-logo {
  display: inline-flex;
  align-items: center;
}

.sidebar-header .sidebar-logo img {
  width: min(240px, 100%);
  height: auto;
  border-radius: 10px;
  object-fit: contain;
  display: block;
}

.sidebar-header .sidebar-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sidebar-header .sidebar-actions .darkmode {
  margin: 0;
}

@media (max-width: 800px) {
  .sidebar.left {
    flex-direction: column;
    align-items: center;
  }

  .sidebar-header {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
  }

  .sidebar-header .sidebar-logo {
    display: none;
  }

  .sidebar-header .sidebar-hamburger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.4rem;
    height: 2.4rem;
    border-radius: 10px;
    background-color: var(--lightgray);
  }

  .sidebar-header .sidebar-logo img {
    width: min(200px, 100%);
  }
}
`

export default (() => SidebarHeader) satisfies QuartzComponentConstructor
