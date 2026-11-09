import { useEffect, useRef } from 'react'
import { createScene, type SceneController } from '../game/scene'
import type { OfficeData } from '../model'

interface Props {
  data: OfficeData
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export function OfficeCanvas({ data, selectedId, onSelect }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<SceneController | null>(null)
  const onSelectRef = useRef(onSelect)
  const selectedRef = useRef(selectedId)
  onSelectRef.current = onSelect
  selectedRef.current = selectedId

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let cancelled = false
    createScene(host, data, (id) => onSelectRef.current(id), () => cancelled).then((scene) => {
      if (!scene) return
      if (cancelled) {
        scene.destroy()
        return
      }
      sceneRef.current = scene
      scene.setSelected(selectedRef.current)
    })
    return () => {
      cancelled = true
      sceneRef.current?.destroy()
      sceneRef.current = null
    }
  }, [data])

  useEffect(() => {
    sceneRef.current?.setSelected(selectedId)
  }, [selectedId])

  return <div className="office-canvas" ref={hostRef} />
}
