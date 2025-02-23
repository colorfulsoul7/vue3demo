<template>
  <div class="dialog-plus">
    <el-dialog ref="dialogRef" v-bind="$attrs" :title="props.title" :top="props.top" :width="props.width"
      @open="beforeDialogOpen" @opened="dialogOpened" @close="beforeDialogClose" @closed="dialogClosed">
      <slot></slot>
      <template #footer>
        <slot name="footer"></slot>
      </template>
    </el-dialog>
  </div>
  <p>  $attrs</p>
  <p>  {{$attrs}}</p>
</template>

<script lang="ts" setup name="ElDialogPlus">
import { ref, onMounted, defineEmits, defineProps } from 'vue'
import { ElDialog } from 'element-plus'

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  top: {
    type: String,
    default: '15vh',
  },
  width: {
    type: String,
    default: '50%',
  },
})

const emits = defineEmits(['open', 'opened', 'close', 'closed'])
/**
 * 弹窗dom对象
 */
const dialogRef = ref<InstanceType<typeof ElDialog>>()
/**
 * 弹窗是否打开（状态持续到 从弹窗打开动画开始前到弹窗关闭动画开始前）
 */
let isdialogOpened = false
/**
 * 弹窗开启动画是否播放完毕
 */
let isAnimationFinished = false
/**
 * 全局捕获鼠标单击按钮时 点击的位置
 */
const mousePosition = {
  x: 0,
  y: 0,
}

/**
 * 弹窗动画的播放起点/终点
 */
const transformOrigin = {
  transformLeft: 0,
  transformTop: 0,
}

/**
 * 弹窗初始的 margin：left top偏移量
 */
const margin = {
  left: 0,
  top: 0,
}

/**
 * 拖拽弹窗的 x，y 轴偏移量
 */
const translate = {
  x: 0,
  y: 0,
}

const localtion = {
  x: 0,
  y: 0,
}

/**
 * 可视区域宽高
 */
const client = {
  width: document.documentElement.clientWidth,
  height: document.documentElement.clientHeight,
}

const init = () => {
  if (props.top.indexOf('%') > -1) {
    localtion.y = client.width * (parseFloat(props.top) / 100)
  } else if (props.top.indexOf('px') > -1) {
    localtion.y = parseFloat(props.top)
  } else if (props.top.indexOf('vh') > -1) {
    localtion.y = client.height * (parseFloat(props.top) / 100)
  }

  if (props.width.indexOf('%') > -1) {
    localtion.x = client.width * (parseFloat(props.width) / 100)
  } else {
    localtion.x = parseFloat(props.width)
  }
  // console.log(props.width);
  // console.log(localtion);
  margin.left = (client.width - localtion.x) / 2
  margin.top = localtion.y
}
init()

// const visible = computed(() => dialogRef.value?.visible);
// watch(
//   () => dialogRef.value?.visible,
//   (newVal) => {
//     console.log(newVal);
//   },
//   { immediate: true },
// );
onMounted(() => {

  // 这里需要使用 addEventListener的第三个参数为true  才能在所有点击事件的捕获阶段触发 即在窗口被打开前 (元素被点击时，先执行这个事件处理程序，然后再执行元素的点击事件)
  document.documentElement.addEventListener('click', clickHandler, true) // 事件捕获
  // nextTick(() => {
  //   internalInstance.attrs.modelValue = false;
  // });
  // setTimeout(() => {
  //   const node = dialogRef.value; // 这里是获取到el-dialog的dom节点
  //   console.log(node);
  // }, 1000);
})

/**
 * @description: 点击事件回调
 * @param {MouseEvent} e
 */
const clickHandler = (e: MouseEvent) => {
  // 只有在弹窗为关闭状态时，才记录点击位置
  if (!isdialogOpened) {
    mousePosition.x = e.x
    mousePosition.y = e.y
  }
}

/**
 * 动画开始前 设置播放起点
 * @param computedStyle 计算样式
 * @param node dom
 */
const setDialogAnimation = (computedStyle: CSSStyleDeclaration, node: any) => {
  computedStyle
  // let width; // 定义对话框宽度
  // if (/px/g.test(computedStyle.width)) {
  //   // 如果宽度是像素类型
  //   // 正则替换像素
  //   width = Number(computedStyle.width.replace(/px/g, ''));
  // } else {
  //   // 宽度为百分比类型
  //   // 正则替换百分比并转化为数字格式
  //   width =
  //     document.documentElement.clientWidth *
  //     (Number(computedStyle.width.replace(/%/g, '')) / 100);
  // }
  // const top = computedStyle.marginTop.replace(/px/g, ''); // 对话框距离顶部的距离
  // 计算变换偏移
  // element-plus 中，对话框默认是居中的

  // 动画播放起点 x轴位置 ： 鼠标点击位置距离视口左侧的距离 - (视口宽度的一半减去对话框宽度的一半) - 对话框在x轴上被拖拽的距离
  // document.documentElement.clientWidth 是整个html页面根标签 即<html>···</html> 的宽度
  transformOrigin.transformLeft =
    mousePosition.x - (client.width - localtion.x) / 2 - translate.x

  // 动画播放起点 y轴位置 ： 鼠标点击位置距离视口顶部的距离 - 对话框距离父元素的高度 - 对话框在y轴上被拖拽的距离
  // 本质上为对话框左上角的 y 距离触发点 y 的距离
  transformOrigin.transformTop = mousePosition.y - localtion.y - translate.y

  node.style.transformOrigin = `${transformOrigin.transformLeft}px ${transformOrigin.transformTop}px`

  node.style.transform = `translate(0px, 0px)` // 动画播放时 不能有任何的translate位移 否则动画会割裂

  // 在动画播放开始前 将对话框原本拖拽 产生的translate位移的 x，y轴值  分别叠加到 对话框原有的margin-left， margin-top上  这样动画不会割裂
  node.style.marginTop = `${margin.top + translate.y}px`
  node.style.marginLeft = `${margin.left + translate.x}px`
}

/**
 * 弹窗打开动画开始前
 */
const beforeDialogOpen = () => {
  isdialogOpened = true
  /* eslint no-empty: ["error", { "allowEmptyCatch": true }] */
  try {
    const node = dialogRef.value?.dialogContentRef.$el // 这里是获取到el-dialog的dom节点
    const computedStyle = getComputedStyle(node) // 弹窗的style样式集合

    getTranslate(node.style.transform) // 动画开始前  获取拖拽偏移量
    // getMargin(node); // 动画开始前  获取对话框原始 margin：left top 值

    setDialogAnimation(computedStyle, node) // 设置弹窗动画起点（清空translate位移值）
  } catch (error) { }
  emits('open')
}

/**
 * 弹窗打开动画结束后
 */
const dialogOpened = () => {
  isAnimationFinished = true
  emits('opened')
  try {
    const node = dialogRef.value?.dialogContentRef.$el // 这里是获取到el-dialog的dom节点

    node.style.transform = `translate(${translate.x}px, ${translate.y}px)` // 动画结束后 还原对话框原本的 拖拽值即translate位移 为了下一次的拖拽，如果不还原，此时再进行二次拖拽会导致对话框位置错乱

    // 动画结束后  将对话框原本的 margin：left top 值 还原
    node.style.marginTop = `${margin.top}px`
    node.style.marginLeft = `${margin.left}px`
  } catch (error) { }
}

/**
 * 弹窗关闭动画开始前
 */
const beforeDialogClose = () => {
  isdialogOpened = false
  emits('close')
  try {
    const node = dialogRef.value?.dialogContentRef.$el // 这里是获取到el-dialog的dom节点
    const computedStyle = getComputedStyle(node) // 弹窗的style样式集合

    // 弹窗打开的动画还没播放完时 就被用户点击遮罩层关闭了 此时需要补充执行弹窗打开动画结束后的逻辑 还原弹窗的translate值和margin值
    if (!isAnimationFinished) {
      node.style.transform = `translate(${translate.x}px, ${translate.y}px)` // 动画结束后 还原对话框原本的 拖拽值即translate位移 为了下一次的拖拽，如果不还原，此时再进行二次拖拽会导致对话框位置错乱

      // 动画结束后  将对话框原本的 margin：left top 值 还原
      node.style.marginTop = `${margin.top}px`
      node.style.marginLeft = `${margin.left}px`
    }

    getTranslate(node.style.transform) // 关闭动画开始前  获取拖拽偏移量 因为用户可能再这次弹窗开启期间进行了二次拖拽，所以这里需要再次获取
    setDialogAnimation(computedStyle, node) // 设置弹窗动画起点（清空translate位移值）
  } catch (error) { }
}

/**
 * 弹窗关闭动画结束后
 */
const dialogClosed = () => {
  isAnimationFinished = false
  emits('closed')
  try {
    const node = dialogRef.value?.dialogContentRef.$el // 这里是获取到el-dialog的dom节点

    node.style.transform = `translate(${translate.x}px, ${translate.y}px)` // 关闭动画结束后  还原对话框原本的 拖拽值即translate位移

    // 关闭动画结束后  将对话框原本的 margin：left top 值 还原 否则下次打开margin值会在 已经叠加了translate位移值的基础上再次叠加 会导致动画起点计算不准确
    node.style.marginTop = `${margin.top}px`
    node.style.marginLeft = `${margin.left}px`
  } catch (error) { }
}

/**
 * 获取弹窗的拖拽x，y轴距离
 * @param css 弹窗的style样式集合
 */
const getTranslate = (css: string) => {
  const regex = /translate\((-?\d+)px, (-?\d+)px\)/
  const match = css.match(regex)

  if (match && parseInt(match[1], 10) !== 0 && parseInt(match[2], 10) !== 0) {
    translate.x = parseInt(match[1], 10) // 第一个数字
    translate.y = parseInt(match[2], 10) // 第二个数字
  }
}

/**
 * 获取弹窗的margin值
 * @param node 弹窗的dom节点
 */
// const getMargin = (node: any) => {
//   try {
//     if (!margin.left) {
//       const computedStyle = getComputedStyle(node); // 弹窗的style样式集合
//       margin.left = Number(computedStyle.marginLeft.replace(/px/g, ''));
//       margin.top = Number(computedStyle.marginTop.replace(/px/g, ''));
//     }
//   } catch (error) {}
// };

defineExpose(dialogRef.value)
</script>

<style lang="scss" scoped>
/* animation.scss */
@keyframes dialog-open {
  0% {
    opacity: 0;
    transform: scale(0.2);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes dialog-close {
  0% {
    opacity: 1;
    transform: scale(1);
  }

  100% {
    opacity: 0;
    transform: scale(0.2);
  }
}

@keyframes fade-out {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}

.dialog-plus {
  ::v-deep(.dialog-fade-enter-active) {
    .el-dialog {
      animation: dialog-open 0.2s cubic-bezier(0.32, 0.14, 0.15, 0.86);
    }
  }

  ::v-deep(.dialog-fade-leave-active) {
    animation: fade-out 0.2s linear;

    .el-dialog {
      animation: dialog-close 0.2s cubic-bezier(0.78, 0.14, 0.15, 0.86);
    }
  }
}
</style>
