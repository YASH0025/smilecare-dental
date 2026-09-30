import "server-only";
import { settingsRepository, websiteContentRepository } from "@/lib/repositories";
import type { ClinicSettings } from "@/types";
import { settingsSchema, websiteContentSchema } from "@/lib/validations";

/** Fields added after the first release — keeps older settings.json files valid. */
const SETTINGS_DEFAULTS: Pick<ClinicSettings, "upiId" | "upiPayeeName"> = { upiId: "", upiPayeeName: "" };

export const settingsService = {
  async get(): Promise<ClinicSettings> {
    const settings = await settingsRepository.get();
    return { ...SETTINGS_DEFAULTS, ...settings, upiPayeeName: settings.upiPayeeName || settings.name };
  },
  async update(input: unknown) {
    const data = settingsSchema.parse(input);
    return settingsRepository.update(data);
  },
};

export const websiteContentService = {
  get: () => websiteContentRepository.get(),
  async update(input: unknown) {
    const data = websiteContentSchema.parse(input);
    return websiteContentRepository.update(data);
  },
};
