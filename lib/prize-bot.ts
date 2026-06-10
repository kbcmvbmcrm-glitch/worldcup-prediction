import {
  PRIZE_BOT_CREATE_NAME,
  PRIZE_BOT_NAMES,
} from "@/lib/constants";
import { supabase } from "@/lib/supabase";

export async function getOrCreatePrizeBot(): Promise<string> {
  const { data: existingBots, error: fetchError } = await supabase
    .from("participants")
    .select("id, name")
    .eq("is_bot", true)
    .in("name", [...PRIZE_BOT_NAMES]);

  if (fetchError) {
    throw new Error(
      `優勝賞金キャリーオーバーの取得に失敗しました: ${fetchError.message}`,
    );
  }

  if (existingBots && existingBots.length > 0) {
    const existingBot = existingBots[0];

    if (existingBot.name !== PRIZE_BOT_CREATE_NAME) {
      const { error: renameError } = await supabase
        .from("participants")
        .update({ name: PRIZE_BOT_CREATE_NAME })
        .eq("id", existingBot.id);

      if (renameError) {
        throw new Error(
          `優勝賞金キャリーオーバーの名称更新に失敗しました: ${renameError.message}`,
        );
      }
    }

    return existingBot.id;
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
    throw new Error(
      `優勝賞金キャリーオーバーの作成に失敗しました: ${createError.message}`,
    );
  }

  return createdBot.id;
}
