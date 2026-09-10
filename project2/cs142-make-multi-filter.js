"use strict"
function cs142MakeMultiFilter(originalArray) {
    let currentArrary = originalArray.slice()  // 浅拷贝创建数组副本

    function arrayFilterer(filterCriteria, callback) {
        if (typeof filterCriteria !== 'function') {
            return currentArrary
        }
        // 根据filterCriteria过滤元素，将符合的组成新数组
        currentArrary = currentArrary.filter(filterCriteria)

        if (typeof callback === 'function') {
            // 使用 call 设置回调函数的 this 为 originalArray
            callback.call(originalArray, currentArrary)
        }

        return arrayFilterer
    }

    return arrayFilterer
}