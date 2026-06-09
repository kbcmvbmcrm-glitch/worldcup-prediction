import { PRIZE_BOT_CREATE_NAME, PRIZE_BOT_NAMES } from "@/lib/constants";
import { supabase } from "@/lib/supabase";

export async function getOrCreatePrizeBot(): Promise<string> {
  const { data: existingBots, error: fetchError } = await supabase
    .from("participants")
    .select("id, name")
    .eq("is_bot", true)
    .in("name", [...PRIZE_BOT_NAMES]);

  if (fetchError) {
    throw new Error(`優勝賞金Botの取得に失敗しました: ${fetchError.message}`);
  }

  if (existingBots && existingBots.length > 0) {
    return existingBots[0].id;
  }

  const { data: createdBot, error: createError } = await supabase
    .from("participants")
    .insert({
      name: PRIZE_BOT_CREATE_NAME,
      is_bot: true,
    })
    .select("id")
    .single();

  if (createError) {
    throw new Error(`優勝賞金Botの作成に失敗しました: ${createError.message}`);
  }

  return createdBot.id;
}
