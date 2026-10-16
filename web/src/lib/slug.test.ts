import { describe, expect, it } from 'vitest'

import { kebabCase } from './slug'

describe('kebabCase', () => {
  it('lowercases and joins words with dashes', () => {
    expect(kebabCase('Internet Banking System')).toBe('internet-banking-system')
  })

  it('collapses runs of non-alphanumerics into one dash', () => {
    expect(kebabCase('Big -- Bank & Co!')).toBe('big-bank-co')
  })

  it('trims leading and trailing dashes', () => {
    expect(kebabCase('  --Bank--  ')).toBe('bank')
  })

  it('leaves already-kebab-case names unchanged', () => {
    expect(kebabCase('internet-banking-system')).toBe('internet-banking-system')
  })

  it('returns an empty string for punctuation-only names', () => {
    expect(kebabCase(' --- ')).toBe('')
  })
})
