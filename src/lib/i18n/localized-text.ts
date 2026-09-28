import { z } from "zod";

export const localizedTextSchema = z.object({
  en: z.string().min(1),
  da: z.string().min(1).optional(),
});

export type LocalizedText = z.infer<typeof localizedTextSchema>;
