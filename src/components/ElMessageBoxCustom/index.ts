/**
 * 二次封装ElMessageBox，优化打开、关闭的动画播放效果，从哪里点开就从哪里投射出来
 */

import {
  type Action,
  ElMessageBox,
  type ElMessageBoxOptions,
  type MessageBoxState,
} from 'element-plus'

const mousePosition = ref({
  x: 0,
  y: 0,
})

/**
 * @description: 点击事件回调
 * @param {MouseEvent} e
 */
const clickHandlers = (e: MouseEvent) => {
  // 只有在弹窗为关闭状态时，才记录点击位置
  mousePosition.value.x = e.x
  mousePosition.value.y = e.y
}

document.documentElement.addEventListener('click', clickHandlers, true) // 事件捕获

interface ElMessageBoxOptionsCustom {
  beforeOpen?: () => void
}

const ElMessageBoxCustom = async (
  options: ElMessageBoxOptions & ElMessageBoxOptionsCustom,
) => {
  await new Promise<void>((resolve) => {
    options.beforeOpen && options.beforeOpen()
    resolve()
  })
  return ElMessageBox({
    ...options,
    customStyle: {
      ...options.customStyle,
      transformOrigin: `calc(${mousePosition.value.x}px - (100vw - 420px) / 2) calc(${mousePosition.value.y}px - 50vh)`,
    },
    customClass: `el-messagebox-plus ${options.customClass}`,
  })
}

ElMessageBoxCustom.confirm = async (
  message?: string,
  title?: string,
  options?: ElMessageBoxOptions & ElMessageBoxOptionsCustom,
) => {
  await new Promise<void>((resolve) => {
    options?.beforeOpen && options?.beforeOpen()
    resolve()
  })
  return ElMessageBox.confirm(message, title, {
    ...options,
    customStyle: {
      ...options?.customStyle,
      transformOrigin: `calc(${mousePosition.value.x}px - (100vw - 420px) / 2) calc(${mousePosition.value.y}px - 50vh)`,
    },
    customClass: `el-messagebox-plus ${options?.customClass ? options.customClass : ''}`,
    beforeClose: (
      action: Action,
      instance: MessageBoxState,
      done: () => void,
    ) => {
      options?.beforeClose
        ? options?.beforeClose(action, instance, done)
        : done()
    },
  })
}

export default ElMessageBoxCustom
