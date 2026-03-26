import { QuartzEmitterPlugin } from "../types"
import { FilePath, FullSlug } from "../../util/path"
import { write } from "./helpers"

export const Ads: QuartzEmitterPlugin = () => {
  return {
    name: "ads",
    getQuartzComponents() {
      return []
    },

    async emit(ctx, _content, resources): Promise<FilePath[]> {
      const cfg = ctx.cfg.configuration

      // ✅ ads.txt / app-ads.txt 내용 정의 (새 애드몹 계정 정보)
      const adsTxtContent = `google.com, pub-3314820536385978, DIRECT, f08c47fec0942fa0`.trim()

      return [
        await write({
          ctx,
          content: adsTxtContent,
          slug: "ads" as FullSlug,
          ext: ".txt",
        }),
        await write({
          ctx,
          content: adsTxtContent,
          slug: "app-ads" as FullSlug,
          ext: ".txt",
        }),
      ]
    },
  }
}