-- Add 'other' as a valid category for common English phrases and expressions
alter table cards drop constraint if exists cards_category_check;
alter table cards add constraint cards_category_check
  check (category in ('word', 'idiom', 'phrasal_verb', 'other'));
