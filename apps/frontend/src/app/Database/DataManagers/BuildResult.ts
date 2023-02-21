import { allCharacterKeys, CharacterKey } from "@genshin-optimizer/consts";
import { deepFreeze } from "../../Util/Util";
import { ArtCharDatabase } from "../Database";
import { DataManager } from "../DataManager";

export interface IBuildResult {
  builds: string[][]
  buildDate: number,
}

export class BuildResultDataManager extends DataManager<CharacterKey, "buildResults", IBuildResult, IBuildResult>{
  constructor(database: ArtCharDatabase) {
    super(database, "buildResults")
    for (const key of this.database.storage.keys)
      if (key.startsWith("buildResult_")) {
        const charKey = key.split("buildResult_")[1] as CharacterKey
        if (!this.set(charKey, {})) this.database.storage.remove(key)
      }
  }
  toStorageKey(key: string): string {
    return `buildResult_${key}`
  }
  validate(obj: unknown, key: CharacterKey): IBuildResult | undefined {
    if (typeof obj !== "object") return
    if (!allCharacterKeys.includes(key)) return
    let { builds, buildDate } = obj as IBuildResult

    if (!Array.isArray(builds)) {
      builds = []
      buildDate = 0
    } else {
      builds = builds.map(build => {
        if (!Array.isArray(build)) return []
        return build.filter(id => this.database.arts.get(id))
      }).filter(x => x.length)
      if (!Number.isInteger(buildDate)) buildDate = 0
    }

    return { builds, buildDate }
  }
  get(key: CharacterKey) {
    return super.get(key) ?? initialBuildResult
  }
}

const initialBuildResult: IBuildResult = deepFreeze({
  builds: [],
  buildDate: 0,
})
