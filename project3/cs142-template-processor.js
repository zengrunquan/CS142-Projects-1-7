"use strict"

// 构造函数
function  Cs142TemplateProcessor(template) {
    this.template = template
}

Cs142TemplateProcessor.prototype.fillIn = function(dictionary) {
    return this.template.replace(/{{(.*?)}}/g, (match, property) => {
        // 还有 {{ month }} --> property = " month "
        const prop = property.trim()

        // 如果字典中存在属性则替换，否则替换为空字符串
        return dictionary[prop] !== undefined ? dictionary[prop] : ''
    })
}