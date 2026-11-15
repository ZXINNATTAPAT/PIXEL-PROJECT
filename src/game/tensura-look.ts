import type { Agent, Look } from '../model'

const costumes: Record<string, Look> = {
  raphael: { theme: 'raphael', hair: '#9ce3ef', skin: '#f5d8cb', shirt: '#e7edf6', longHair: true },
  diablo: { theme: 'diablo', hair: '#201a2a', skin: '#efd6cb', shirt: '#222638' },
  testarossa: { theme: 'testarossa', hair: '#f4eff6', skin: '#f7dce1', shirt: '#222638', longHair: true },
  michael: { theme: 'michael', hair: '#ecd087', skin: '#f0d5ba', shirt: '#222638' },
}

export function tensuraLook(agent: Agent): Look {
  if (Object.hasOwn(costumes, agent.id)) return costumes[agent.id]
  const variant = [...agent.id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 3
  return { theme: 'goblin', hair: ['#496047', '#d6d6b7', '#547251'][variant], skin: ['#9fc76a', '#85b968', '#b1ce7a'][variant], shirt: '#222638' }
}
