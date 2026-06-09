-- ============================================================
-- World Cup Prediction App - Supabase RLS / GRANT 設定
-- Supabase SQL Editor にコピペして実行してください。
-- 重複実行しても壊れにくいよう DROP IF EXISTS を使用しています。
-- ============================================================

-- ------------------------------------------------------------
-- 1. テーブル権限（anon ロール）
-- ------------------------------------------------------------
GRANT SELECT ON TABLE public.participants TO anon;
GRANT INSERT ON TABLE public.participants TO anon;
GRANT UPDATE ON TABLE public.participants TO anon;
GRANT DELETE ON TABLE public.participants TO anon;

GRANT SELECT ON TABLE public.matches TO anon;
GRANT INSERT ON TABLE public.matches TO anon;
GRANT UPDATE ON TABLE public.matches TO anon;
GRANT DELETE ON TABLE public.matches TO anon;

GRANT SELECT ON TABLE public.predictions TO anon;
GRANT INSERT ON TABLE public.predictions TO anon;
GRANT UPDATE ON TABLE public.predictions TO anon;
GRANT DELETE ON TABLE public.predictions TO anon;

GRANT SELECT ON TABLE public.chip_transactions TO anon;
GRANT INSERT ON TABLE public.chip_transactions TO anon;
GRANT DELETE ON TABLE public.chip_transactions TO anon;

-- ------------------------------------------------------------
-- 2. RLS 有効化
-- ------------------------------------------------------------
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chip_transactions ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- 3. participants ポリシー
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "anon_select_participants" ON public.participants;
CREATE POLICY "anon_select_participants"
ON public.participants FOR SELECT TO anon
USING (true);

DROP POLICY IF EXISTS "anon_insert_participants" ON public.participants;
CREATE POLICY "anon_insert_participants"
ON public.participants FOR INSERT TO anon
WITH CHECK (is_bot = false);

DROP POLICY IF EXISTS "anon_update_participants" ON public.participants;
CREATE POLICY "anon_update_participants"
ON public.participants FOR UPDATE TO anon
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_participants" ON public.participants;
CREATE POLICY "anon_delete_participants"
ON public.participants FOR DELETE TO anon
USING (true);

-- ------------------------------------------------------------
-- 4. matches ポリシー
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "anon_select_matches" ON public.matches;
CREATE POLICY "anon_select_matches"
ON public.matches FOR SELECT TO anon
USING (true);

DROP POLICY IF EXISTS "anon_insert_matches" ON public.matches;
CREATE POLICY "anon_insert_matches"
ON public.matches FOR INSERT TO anon
WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_matches" ON public.matches;
CREATE POLICY "anon_update_matches"
ON public.matches FOR UPDATE TO anon
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_matches" ON public.matches;
CREATE POLICY "anon_delete_matches"
ON public.matches FOR DELETE TO anon
USING (true);

-- ------------------------------------------------------------
-- 5. predictions ポリシー
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "anon_select_predictions" ON public.predictions;
CREATE POLICY "anon_select_predictions"
ON public.predictions FOR SELECT TO anon
USING (true);

DROP POLICY IF EXISTS "anon_insert_predictions" ON public.predictions;
CREATE POLICY "anon_insert_predictions"
ON public.predictions FOR INSERT TO anon
WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_predictions" ON public.predictions;
CREATE POLICY "anon_update_predictions"
ON public.predictions FOR UPDATE TO anon
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_predictions" ON public.predictions;
CREATE POLICY "anon_delete_predictions"
ON public.predictions FOR DELETE TO anon
USING (true);

-- ------------------------------------------------------------
-- 6. chip_transactions ポリシー
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "anon_select_chip_transactions" ON public.chip_transactions;
CREATE POLICY "anon_select_chip_transactions"
ON public.chip_transactions FOR SELECT TO anon
USING (true);

DROP POLICY IF EXISTS "anon_insert_chip_transactions" ON public.chip_transactions;
CREATE POLICY "anon_insert_chip_transactions"
ON public.chip_transactions FOR INSERT TO anon
WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_chip_transactions" ON public.chip_transactions;
CREATE POLICY "anon_delete_chip_transactions"
ON public.chip_transactions FOR DELETE TO anon
USING (true);

-- ------------------------------------------------------------
-- 7. データ修正（必要に応じて）
-- ------------------------------------------------------------
UPDATE public.matches
SET bet_amount = 500
WHERE bet_amount = 100;

ALTER TABLE public.matches
ALTER COLUMN bet_amount SET DEFAULT 500;

-- 参加者名の重複防止（任意・本番推奨）
-- CREATE UNIQUE INDEX IF NOT EXISTS participants_name_unique
-- ON public.participants (name);
