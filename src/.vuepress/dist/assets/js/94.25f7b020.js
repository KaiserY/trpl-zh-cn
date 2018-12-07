(window.webpackJsonp=window.webpackJsonp||[]).push([[94],{176:function(t,s,a){"use strict";a.r(s);var n=a(0),e=Object(n.a)({},function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("div",{staticClass:"content"},[t._m(0),t._v(" "),a("blockquote",[a("p",[a("a",{attrs:{href:"https://github.com/rust-lang/book/blob/master/second-edition/src/ch18-01-all-the-places-for-patterns.md",target:"_blank",rel:"noopener noreferrer"}},[t._v("ch18-01-all-the-places-for-patterns.md"),a("OutboundLink")],1),t._v(" "),a("br"),t._v("\ncommit b1de391964190a0cec101ecfc86e05c9351af565")])]),t._v(" "),a("p",[t._v("模式出现在 Rust 的很多地方。你已经在不经意间使用了很多模式！本部分是一个所有有效模式位置的参考。")]),t._v(" "),t._m(1),t._v(" "),t._m(2),t._v(" "),t._m(3),t._m(4),t._v(" "),t._m(5),t._v(" "),t._m(6),t._v(" "),t._m(7),t._v(" "),t._m(8),t._v(" "),a("p",[t._v("示例 18-1 中的代码展示了一系列针对不同条件的检查来决定背景颜色应该是什么。为了达到这个例子的目的，我们创建了硬编码值的变量，在真实程序中则可能由询问用户获得。")]),t._v(" "),a("p",[t._v("如果用户指定了中意的颜色，将使用其作为背景颜色。如果今天是星期二，背景颜色将是绿色。如果用户指定了他们的年龄字符串并能够成功将其解析为数字的话，我们将根据这个数字使用紫色或者橙色。最后，如果没有一个条件符合，背景颜色将是蓝色：")]),t._v(" "),t._m(9),t._v(" "),t._m(10),t._m(11),t._v(" "),t._m(12),t._v(" "),t._m(13),t._v(" "),t._m(14),t._v(" "),t._m(15),t._v(" "),t._m(16),t._v(" "),t._m(17),t._m(18),t._v(" "),t._m(19),t._v(" "),t._m(20),t._v(" "),t._m(21),t._v(" "),t._m(22),t._v(" "),t._m(23),t._m(24),t._v(" "),a("p",[t._v("这会打印出：")]),t._v(" "),t._m(25),t._m(26),t._v(" "),t._m(27),t._v(" "),t._m(28),t._v(" "),t._m(29),t._m(30),t._v(" "),t._m(31),t._m(32),t._v(" "),t._m(33),t._v(" "),t._m(34),t._m(35),t._v(" "),t._m(36),t._v(" "),a("p",[t._v("如果模式中元素的数量不匹配元组中元素的数量，则整个类型不匹配，并会得到一个编译时错误。例如，示例 18-5 展示了尝试用两个变量解构三个元素的元组，这是不行的：")]),t._v(" "),t._m(37),t._m(38),t._v(" "),a("p",[t._v("尝试编译这段代码会给出如下类型错误：")]),t._v(" "),t._m(39),t._m(40),t._v(" "),t._m(41),t._v(" "),t._m(42),t._v(" "),t._m(43),t._m(44),t._v(" "),t._m(45),t._v(" "),t._m(46),t._v(" "),t._m(47),t._m(48),t._v(" "),t._m(49),t._v(" "),a("p",[t._v("因为如第十三章所讲闭包类似于函数，也可以在闭包参数中使用模式。")]),t._v(" "),t._m(50)])},[function(){var t=this.$createElement,s=this._self._c||t;return s("h2",{attrs:{id:"所有可能会用到模式的位置"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#所有可能会用到模式的位置","aria-hidden":"true"}},[this._v("#")]),this._v(" 所有可能会用到模式的位置")])},function(){var t=this.$createElement,s=this._self._c||t;return s("h3",{attrs:{id:"match-分支"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#match-分支","aria-hidden":"true"}},[this._v("#")]),this._v(" "),s("code",[this._v("match")]),this._v(" 分支")])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("如第六章所讨论的，一个模式常用的位置是 "),s("code",[this._v("match")]),this._v(" 表达式的分支。在形式上 "),s("code",[this._v("match")]),this._v(" 表达式由 "),s("code",[this._v("match")]),this._v(" 关键字、用于匹配的值和一个或多个分支构成，这些分支包含一个模式和在值匹配分支的模式时运行的表达式：")])},function(){var t=this.$createElement,s=this._self._c||t;return s("div",{staticClass:"language-text extra-class"},[s("pre",{pre:!0,attrs:{class:"language-text"}},[s("code",[this._v("match VALUE {\n    PATTERN => EXPRESSION,\n    PATTERN => EXPRESSION,\n    PATTERN => EXPRESSION,\n}\n")])])])},function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("p",[a("code",[t._v("match")]),t._v(" 表达式必须是 "),a("strong",[t._v("穷尽")]),t._v("（"),a("em",[t._v("exhaustive")]),t._v("）的，意为 "),a("code",[t._v("match")]),t._v(" 表达式所有可能的值都必须被考虑到。一个确保覆盖每个可能值的方法是在最后一个分支使用捕获所有的模式 —— 比如，一个匹配任何值的名称永远也不会失败，因此可以覆盖所有匹配剩下的情况。")])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("有一个特定的模式 "),s("code",[this._v("_")]),this._v(" 可以匹配所有情况，不过它从不绑定任何变量。这在例如希望忽略任何未指定值的情况很有用。本章之后会详细讲解。")])},function(){var t=this.$createElement,s=this._self._c||t;return s("h3",{attrs:{id:"if-let-条件表达式"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#if-let-条件表达式","aria-hidden":"true"}},[this._v("#")]),this._v(" "),s("code",[this._v("if let")]),this._v(" 条件表达式")])},function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("p",[t._v("第六章讨论过了 "),a("code",[t._v("if let")]),t._v(" 表达式，以及它是如何主要用于编写等同于只关心一个情况的 "),a("code",[t._v("match")]),t._v(" 语句简写的。"),a("code",[t._v("if let")]),t._v(" 可以对应一个可选的带有代码的 "),a("code",[t._v("else")]),t._v(" 在 "),a("code",[t._v("if let")]),t._v(" 中的模式不匹配时运行。")])},function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("p",[t._v("示例 18-1 展示了也可以组合并匹配 "),a("code",[t._v("if let")]),t._v("、"),a("code",[t._v("else if")]),t._v(" 和 "),a("code",[t._v("else if let")]),t._v(" 表达式。这相比 "),a("code",[t._v("match")]),t._v(" 表达式一次只能将一个值与模式比较提供了更多灵活性；一系列 "),a("code",[t._v("if let")]),t._v("/"),a("code",[t._v("else if")]),t._v("/"),a("code",[t._v("else if let")]),t._v(" 分支并不要求其条件相互关联。")])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[s("span",{staticClass:"filename"},[this._v("文件名: src/main.rs")])])},function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("div",{staticClass:"language-rust extra-class"},[a("pre",{pre:!0,attrs:{class:"language-rust"}},[a("code",[a("span",{attrs:{class:"token keyword"}},[t._v("fn")]),t._v(" "),a("span",{attrs:{class:"token function"}},[t._v("main")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),a("span",{attrs:{class:"token keyword"}},[t._v("let")]),t._v(" favorite_color"),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" Option"),a("span",{attrs:{class:"token operator"}},[t._v("<")]),a("span",{attrs:{class:"token operator"}},[t._v("&")]),t._v("str"),a("span",{attrs:{class:"token operator"}},[t._v(">")]),t._v(" "),a("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" None"),a("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),a("span",{attrs:{class:"token keyword"}},[t._v("let")]),t._v(" is_tuesday "),a("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{attrs:{class:"token keyword"}},[t._v("false")]),a("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),a("span",{attrs:{class:"token keyword"}},[t._v("let")]),t._v(" age"),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" Result"),a("span",{attrs:{class:"token operator"}},[t._v("<")]),t._v("u8"),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" _"),a("span",{attrs:{class:"token operator"}},[t._v(">")]),t._v(" "),a("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{attrs:{class:"token string"}},[t._v('"34"')]),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{attrs:{class:"token function"}},[t._v("parse")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n    "),a("span",{attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),a("span",{attrs:{class:"token keyword"}},[t._v("let")]),t._v(" "),a("span",{attrs:{class:"token function"}},[t._v("Some")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("color"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" favorite_color "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),a("span",{attrs:{class:"token function"}},[t._v("println!")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token string"}},[t._v('"Using your favorite color, {}, as the background"')]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" color"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" "),a("span",{attrs:{class:"token keyword"}},[t._v("else")]),t._v(" "),a("span",{attrs:{class:"token keyword"}},[t._v("if")]),t._v(" is_tuesday "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),a("span",{attrs:{class:"token function"}},[t._v("println!")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token string"}},[t._v('"Tuesday is green day!"')]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" "),a("span",{attrs:{class:"token keyword"}},[t._v("else")]),t._v(" "),a("span",{attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),a("span",{attrs:{class:"token keyword"}},[t._v("let")]),t._v(" "),a("span",{attrs:{class:"token function"}},[t._v("Ok")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("age"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" age "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),a("span",{attrs:{class:"token keyword"}},[t._v("if")]),t._v(" age "),a("span",{attrs:{class:"token operator"}},[t._v(">")]),t._v(" "),a("span",{attrs:{class:"token number"}},[t._v("30")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n            "),a("span",{attrs:{class:"token function"}},[t._v("println!")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token string"}},[t._v('"Using purple as the background color"')]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n        "),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" "),a("span",{attrs:{class:"token keyword"}},[t._v("else")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n            "),a("span",{attrs:{class:"token function"}},[t._v("println!")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token string"}},[t._v('"Using orange as the background color"')]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n        "),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    "),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" "),a("span",{attrs:{class:"token keyword"}},[t._v("else")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),a("span",{attrs:{class:"token function"}},[t._v("println!")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token string"}},[t._v('"Using blue as the background color"')]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])])},function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("p",[a("span",{staticClass:"caption"},[t._v("示例 18-1: 结合 "),a("code",[t._v("if let")]),t._v("、"),a("code",[t._v("else if")]),t._v("、"),a("code",[t._v("else if let")]),t._v(" 以及 "),a("code",[t._v("else")])])])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("这个条件结构允许我们支持复杂的需求。使用这里硬编码的值，例子会打印出 "),s("code",[this._v("Using purple as the background color")]),this._v("。")])},function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("p",[t._v("注意 "),a("code",[t._v("if let")]),t._v(" 也可以像 "),a("code",[t._v("match")]),t._v(" 分支那样引入覆盖变量："),a("code",[t._v("if let Ok(age) = age")]),t._v(" 引入了一个新的覆盖变量 "),a("code",[t._v("age")]),t._v("，它包含 "),a("code",[t._v("Ok")]),t._v(" 成员中的值。这意味着 "),a("code",[t._v("if age > 30")]),t._v(" 条件需要位于这个代码块内部；不能将两个条件组合为 "),a("code",[t._v("if let Ok(age) = age && age > 30")]),t._v("，因为我们希望与 30 进行比较的被覆盖的 "),a("code",[t._v("age")]),t._v(" 直到大括号开始的新作用域才是有效的。")])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[s("code",[this._v("if let")]),this._v(" 表达式的缺点在于其穷尽性没有为编译器所检查，而 "),s("code",[this._v("match")]),this._v(" 表达式则检查了。如果去掉最后的 "),s("code",[this._v("else")]),this._v(" 块而遗漏处理一些情况，编译器也不会警告这类可能的逻辑错误。")])},function(){var t=this.$createElement,s=this._self._c||t;return s("h3",{attrs:{id:"while-let-条件循环"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#while-let-条件循环","aria-hidden":"true"}},[this._v("#")]),this._v(" "),s("code",[this._v("while let")]),this._v(" 条件循环")])},function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("p",[t._v("一个与 "),a("code",[t._v("if let")]),t._v(" 结构类似的是 "),a("code",[t._v("while let")]),t._v(" 条件循环，它允许只要模式匹配就一直进行 "),a("code",[t._v("while")]),t._v(" 循环。示例 18-2 展示了一个使用 "),a("code",[t._v("while let")]),t._v(" 的例子，它使用 vector 作为栈并以先进后出的方式打印出 vector 中的值：")])},function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("div",{staticClass:"language-rust extra-class"},[a("pre",{pre:!0,attrs:{class:"language-rust"}},[a("code",[a("span",{attrs:{class:"token keyword"}},[t._v("let")]),t._v(" "),a("span",{attrs:{class:"token keyword"}},[t._v("mut")]),t._v(" stack "),a("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" Vec"),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),a("span",{attrs:{class:"token function"}},[t._v("new")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\nstack"),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{attrs:{class:"token function"}},[t._v("push")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token number"}},[t._v("1")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\nstack"),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{attrs:{class:"token function"}},[t._v("push")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token number"}},[t._v("2")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\nstack"),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{attrs:{class:"token function"}},[t._v("push")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token number"}},[t._v("3")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n"),a("span",{attrs:{class:"token keyword"}},[t._v("while")]),t._v(" "),a("span",{attrs:{class:"token keyword"}},[t._v("let")]),t._v(" "),a("span",{attrs:{class:"token function"}},[t._v("Some")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("top"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" stack"),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{attrs:{class:"token function"}},[t._v("pop")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),a("span",{attrs:{class:"token function"}},[t._v("println!")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token string"}},[t._v('"{}"')]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" top"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[s("span",{staticClass:"caption"},[this._v("列表 18-2: 使用 "),s("code",[this._v("while let")]),this._v(" 循环只要 "),s("code",[this._v("stack.pop()")]),this._v(" 返回 "),s("code",[this._v("Some")]),this._v(" 就打印出其值")])])},function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("p",[t._v("这个例子会打印出 3、2 接着是 1。"),a("code",[t._v("pop")]),t._v(" 方法取出 vector 的最后一个元素并返回 "),a("code",[t._v("Some(value)")]),t._v("。如果 vector 是空的，它返回 "),a("code",[t._v("None")]),t._v("。"),a("code",[t._v("while")]),t._v(" 循环只要 "),a("code",[t._v("pop")]),t._v(" 返回 "),a("code",[t._v("Some")]),t._v(" 就会一直运行其块中的代码。一旦其返回 "),a("code",[t._v("None")]),t._v("，"),a("code",[t._v("while")]),t._v(" 循环停止。我们可以使用 "),a("code",[t._v("while let")]),t._v(" 来弹出栈中的每一个元素。")])},function(){var t=this.$createElement,s=this._self._c||t;return s("h3",{attrs:{id:"for-循环"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#for-循环","aria-hidden":"true"}},[this._v("#")]),this._v(" "),s("code",[this._v("for")]),this._v(" 循环")])},function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("p",[t._v("如同第三章所讲的，"),a("code",[t._v("for")]),t._v(" 循环是 Rust 中最常见的循环结构，不过还没有讲到的是 "),a("code",[t._v("for")]),t._v(" 可以获取一个模式。在 "),a("code",[t._v("for")]),t._v(" 循环中，模式是 "),a("code",[t._v("for")]),t._v(" 关键字直接跟随的值，正如 "),a("code",[t._v("for x in y")]),t._v(" 中的 "),a("code",[t._v("x")]),t._v("。")])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("示例 18-3 中展示了如何使用 "),s("code",[this._v("for")]),this._v(" 循环来解构，或拆开一个元组作为 "),s("code",[this._v("for")]),this._v(" 循环的一部分：")])},function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("div",{staticClass:"language-rust extra-class"},[a("pre",{pre:!0,attrs:{class:"language-rust"}},[a("code",[a("span",{attrs:{class:"token keyword"}},[t._v("let")]),t._v(" v "),a("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{attrs:{class:"token function"}},[t._v("vec!")]),a("span",{attrs:{class:"token punctuation"}},[t._v("[")]),a("span",{attrs:{class:"token char string"}},[t._v("'a'")]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{attrs:{class:"token char string"}},[t._v("'b'")]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{attrs:{class:"token char string"}},[t._v("'c'")]),a("span",{attrs:{class:"token punctuation"}},[t._v("]")]),a("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n"),a("span",{attrs:{class:"token keyword"}},[t._v("for")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("index"),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" value"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{attrs:{class:"token keyword"}},[t._v("in")]),t._v(" v"),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{attrs:{class:"token function"}},[t._v("iter")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{attrs:{class:"token function"}},[t._v("enumerate")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),a("span",{attrs:{class:"token function"}},[t._v("println!")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token string"}},[t._v('"{} is at index {}"')]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" value"),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" index"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[s("span",{staticClass:"caption"},[this._v("列表 18-3: 在 "),s("code",[this._v("for")]),this._v(" 循环中使用模式来解构元组")])])},function(){var t=this.$createElement,s=this._self._c||t;return s("div",{staticClass:"language-text extra-class"},[s("pre",{pre:!0,attrs:{class:"language-text"}},[s("code",[this._v("a is at index 0\nb is at index 1\nc is at index 2\n")])])])},function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("p",[t._v("这里使用 "),a("code",[t._v("enumerate")]),t._v(" 方法适配一个迭代器来产生一个值和其在迭代器中的索引，他们位于一个元组中。第一个 "),a("code",[t._v("enumerate")]),t._v(" 调用会产生元组 "),a("code",[t._v("(0, 'a')")]),t._v("。当这个值匹配模式 "),a("code",[t._v("(index, value)")]),t._v("，"),a("code",[t._v("index")]),t._v(" 将会是 0 而 "),a("code",[t._v("value")]),t._v(" 将会是 'a'，并打印出第一行输出。")])},function(){var t=this.$createElement,s=this._self._c||t;return s("h3",{attrs:{id:"let-语句"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#let-语句","aria-hidden":"true"}},[this._v("#")]),this._v(" "),s("code",[this._v("let")]),this._v(" 语句")])},function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("p",[t._v("在本章之前，我们只明确的讨论过通过 "),a("code",[t._v("match")]),t._v(" 和 "),a("code",[t._v("if let")]),t._v(" 使用模式，不过事实上也在别地地方使用过模式，包括 "),a("code",[t._v("let")]),t._v(" 语句。例如，考虑一下这个直白的 "),a("code",[t._v("let")]),t._v(" 变量赋值：")])},function(){var t=this.$createElement,s=this._self._c||t;return s("div",{staticClass:"language-rust extra-class"},[s("pre",{pre:!0,attrs:{class:"language-rust"}},[s("code",[s("span",{attrs:{class:"token keyword"}},[this._v("let")]),this._v(" x "),s("span",{attrs:{class:"token operator"}},[this._v("=")]),this._v(" "),s("span",{attrs:{class:"token number"}},[this._v("5")]),s("span",{attrs:{class:"token punctuation"}},[this._v(";")]),this._v("\n")])])])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("本书进行了不下百次这样的操作。你可能没有发觉，不过你这正是在使用模式！"),s("code",[this._v("let")]),this._v(" 语句更为正式的样子如下：")])},function(){var t=this.$createElement,s=this._self._c||t;return s("div",{staticClass:"language-text extra-class"},[s("pre",{pre:!0,attrs:{class:"language-text"}},[s("code",[this._v("let PATTERN = EXPRESSION;\n")])])])},function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("p",[t._v("像 "),a("code",[t._v("let x = 5;")]),t._v(" 这样的语句中变量名位于 "),a("code",[t._v("PATTERN")]),t._v(" 位置，变量名不过是形式特别朴素的模式。我们将表达式与模式比较，并为任何找到的名称赋值。所以例如 "),a("code",[t._v("let x = 5;")]),t._v(" 的情况，"),a("code",[t._v("x")]),t._v(" 是一个模式代表 “将匹配到的值绑定到变量 x”。同时因为名称 "),a("code",[t._v("x")]),t._v(" 是整个模式，这个模式实际上等于 “将任何值绑定到变量 "),a("code",[t._v("x")]),t._v("，不管值是什么”。")])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("为了更清楚的理解 "),s("code",[this._v("let")]),this._v(" 的模式匹配方面的内容，考虑示例 18-4 中使用 "),s("code",[this._v("let")]),this._v(" 和模式解构一个元组：")])},function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("div",{staticClass:"language-rust extra-class"},[a("pre",{pre:!0,attrs:{class:"language-rust"}},[a("code",[a("span",{attrs:{class:"token keyword"}},[t._v("let")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("x"),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" y"),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" z"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token number"}},[t._v("1")]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{attrs:{class:"token number"}},[t._v("2")]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{attrs:{class:"token number"}},[t._v("3")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[s("span",{staticClass:"caption"},[this._v("示例 18-4: 使用模式解构元组并一次创建三个变量")])])},function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("p",[t._v("这里将一个元组与模式匹配。Rust 会比较值 "),a("code",[t._v("(1, 2, 3)")]),t._v(" 与模式 "),a("code",[t._v("(x, y, z)")]),t._v(" 并发现此值匹配这个模式。在这个例子中，将会把 "),a("code",[t._v("1")]),t._v(" 绑定到 "),a("code",[t._v("x")]),t._v("，"),a("code",[t._v("2")]),t._v(" 绑定到 "),a("code",[t._v("y")]),t._v(" 并将 "),a("code",[t._v("3")]),t._v(" 绑定到 "),a("code",[t._v("z")]),t._v("。你可以将这个元组模式看作是将三个独立的变量模式结合在一起。")])},function(){var t=this.$createElement,s=this._self._c||t;return s("div",{staticClass:"language-rust,ignore extra-class"},[s("pre",{pre:!0,attrs:{class:"language-text"}},[s("code",[this._v("let (x, y) = (1, 2, 3);\n")])])])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[s("span",{staticClass:"caption"},[this._v("示例 18-5: 一个错误的模式结构，其中变量的数量不符合元组中元素的数量")])])},function(){var t=this.$createElement,s=this._self._c||t;return s("div",{staticClass:"language-text extra-class"},[s("pre",{pre:!0,attrs:{class:"language-text"}},[s("code",[this._v("error[E0308]: mismatched types\n --\x3e src/main.rs:2:9\n  |\n2 |     let (x, y) = (1, 2, 3);\n  |         ^^^^^^ expected a tuple with 3 elements, found one with 2 elements\n  |\n  = note: expected type `({integer}, {integer}, {integer})`\n             found type `(_, _)`\n")])])])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("如果希望忽略元组中一个或多个值，也可以使用 "),s("code",[this._v("_")]),this._v(" 或 "),s("code",[this._v("..")]),this._v("，如 “忽略模式中的值” 部分所示。如果问题是模式中有太多的变量，则解决方法是通过去掉变量使得变量数与元组中元素数相等。")])},function(){var t=this.$createElement,s=this._self._c||t;return s("h3",{attrs:{id:"函数参数"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#函数参数","aria-hidden":"true"}},[this._v("#")]),this._v(" 函数参数")])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("函数参数也可以是模式。列表 18-6 中的代码声明了一个叫做 "),s("code",[this._v("foo")]),this._v(" 的函数，它获取一个 "),s("code",[this._v("i32")]),this._v(" 类型的参数 "),s("code",[this._v("x")]),this._v("，现在这看起来应该很熟悉：")])},function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("div",{staticClass:"language-rust extra-class"},[a("pre",{pre:!0,attrs:{class:"language-rust"}},[a("code",[a("span",{attrs:{class:"token keyword"}},[t._v("fn")]),t._v(" "),a("span",{attrs:{class:"token function"}},[t._v("foo")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("x"),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" i32"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),a("span",{attrs:{class:"token comment"}},[t._v("// code goes here")]),t._v("\n"),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[s("span",{staticClass:"caption"},[this._v("列表 18-6: 在参数中使用模式的函数签名")])])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[s("code",[this._v("x")]),this._v(" 部分就是一个模式！类似于之前对 "),s("code",[this._v("let")]),this._v(" 所做的，可以在函数参数中匹配元组。列表 18-7 将传递给函数的元组拆分为值：")])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[s("span",{staticClass:"filename"},[this._v("文件名: src/main.rs")])])},function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("div",{staticClass:"language-rust extra-class"},[a("pre",{pre:!0,attrs:{class:"language-rust"}},[a("code",[a("span",{attrs:{class:"token keyword"}},[t._v("fn")]),t._v(" "),a("span",{attrs:{class:"token function"}},[t._v("print_coordinates")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token operator"}},[t._v("&")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("x"),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" y"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{attrs:{class:"token operator"}},[t._v("&")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("i32"),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" i32"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),a("span",{attrs:{class:"token function"}},[t._v("println!")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token string"}},[t._v('"Current location: ({}, {})"')]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" x"),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" y"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\n"),a("span",{attrs:{class:"token keyword"}},[t._v("fn")]),t._v(" "),a("span",{attrs:{class:"token function"}},[t._v("main")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),a("span",{attrs:{class:"token keyword"}},[t._v("let")]),t._v(" point "),a("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token number"}},[t._v("3")]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{attrs:{class:"token number"}},[t._v("5")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),a("span",{attrs:{class:"token function"}},[t._v("print_coordinates")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token operator"}},[t._v("&")]),t._v("point"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[s("span",{staticClass:"caption"},[this._v("列表 18-7: 一个在参数中解构元组的函数")])])},function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("p",[t._v("这会打印出 "),a("code",[t._v("Current location: (3, 5)")]),t._v("。值 "),a("code",[t._v("&(3, 5)")]),t._v(" 会匹配模式 "),a("code",[t._v("&(x, y)")]),t._v("，如此 "),a("code",[t._v("x")]),t._v(" 得到了值 3，而 "),a("code",[t._v("y")]),t._v("得到了值 5。")])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("现在我们见过了很多使用模式的方式了，不过模式在每个使用它的地方并不以相同的方式工作；在一些地方，模式必须是 "),s("em",[this._v("irrefutable")]),this._v(" 的，意味着他们必须匹配所提供的任何值。在另一些情况，他们则可以是 refutable 的。接下来让我们讨论这个。")])}],!1,null,null,null);e.options.__file="ch18-01-all-the-places-for-patterns.md";s.default=e.exports}}]);