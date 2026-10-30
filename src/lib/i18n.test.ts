import { afterEach, describe, expect, it } from 'vitest'
import { QUESTIONS } from '../data/quiz'
import { getLang, setLang, t } from './i18n'
import { lq } from './quizText'

afterEach(() => setLang('en'))

describe('i18n', () => {
  it('defaults to English and fills placeholders', () => {
    expect(getLang()).toBe('en')
    expect(t('Question {i} of {n}', { i: 2, n: 15 })).toBe('Question 2 of 15')
    expect(lq(QUESTIONS[0]).prompt).toBe(QUESTIONS[0].prompt)
  })
  it('switches to Hebrew, keeps placeholders and falls back to English for unknown keys', async () => {
    await setLang('he')
    expect(t('Cancel')).toBe('ביטול')
    expect(t('Question {i} of {n}', { i: 2, n: 15 })).toBe('שאלה 2 מתוך 15')
    expect(t('not a real key')).toBe('not a real key')
    const q = lq(QUESTIONS[0])
    expect(q.prompt).not.toBe(QUESTIONS[0].prompt)
    expect(q.category).toBe(QUESTIONS[0].category)
    expect(q.source).toEqual(QUESTIONS[0].source)
  })
})
