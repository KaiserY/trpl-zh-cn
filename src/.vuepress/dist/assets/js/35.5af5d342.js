(window.webpackJsonp=window.webpackJsonp||[]).push([[35],{235:function(t,s,n){"use strict";n.r(s);var a=n(0),e=Object(a.a)({},function(){var t=this,s=t.$createElement,n=t._self._c||s;return n("div",{staticClass:"content"},[t._m(0),t._v(" "),n("blockquote",[n("p",[n("a",{attrs:{href:"https://github.com/rust-lang/book/blob/master/src/ch06-02-match.md",target:"_blank",rel:"noopener noreferrer"}},[t._v("ch06-02-match.md"),n("OutboundLink")],1),t._v(" "),n("br"),t._v("\ncommit a86c1d315789b3ca13b20d50ad5005c62bdd9e37")])]),t._v(" "),t._m(1),t._v(" "),t._m(2),t._v(" "),t._m(3),t._v(" "),t._m(4),t._m(5),t._v(" "),t._m(6),t._v(" "),t._m(7),t._v(" "),t._m(8),t._v(" "),t._m(9),t._v(" "),t._m(10),t._v(" "),t._m(11),t._m(12),t._v(" "),n("p",[t._v("匹配分支的另一个有用的功能是可以绑定匹配的模式的部分值。这也就是如何从枚举成员中提取值的。")]),t._v(" "),t._m(13),t._v(" "),t._m(14),t._m(15),t._v(" "),n("p",[t._v("想象一下我们的一个朋友尝试收集所有 50 个州的 25 美分硬币。在根据硬币类型分类零钱的同时，也可以报告出每个 25 美分硬币所对应的州名称，这样如果我们的朋友没有的话，他可以将其加入收藏。")]),t._v(" "),t._m(16),t._v(" "),t._m(17),t._m(18),t._v(" "),t._m(19),t._v(" "),t._m(20),t._v(" "),t._m(21),t._v(" "),t._m(22),t._v(" "),t._m(23),t._m(24),t._v(" "),t._m(25),t._v(" "),t._m(26),t._v(" "),t._m(27),t._m(28),t._v(" "),t._m(29),t._m(30),t._v(" "),t._m(31),t._v(" "),t._m(32),t._m(33),t._v(" "),t._m(34),t._v(" "),t._m(35),t._v(" "),t._m(36),t._v(" "),t._m(37),t._m(38),t._v(" "),t._m(39),t._m(40),t._v(" "),t._m(41),t._v(" "),t._m(42),t._v(" "),t._m(43),t._m(44),t._v(" "),t._m(45)])},[function(){var t=this.$createElement,s=this._self._c||t;return s("h2",{attrs:{id:"match-控制流运算符"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#match-控制流运算符","aria-hidden":"true"}},[this._v("#")]),this._v(" "),s("code",[this._v("match")]),this._v(" 控制流运算符")])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("Rust 有一个叫做 "),s("code",[this._v("match")]),this._v(" 的极为强大的控制流运算符，它允许我们将一个值与一系列的模式相比较并根据相匹配的模式执行相应代码。模式可由字面值、变量、通配符和许多其他内容构成；第十八章会涉及到所有不同种类的模式以及它们的作用。"),s("code",[this._v("match")]),this._v(" 的力量来源于模式的表现力以及编译器检查，它确保了所有可能的情况都得到处理。")])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("可以把 "),s("code",[this._v("match")]),this._v(" 表达式想象成某种硬币分类器：硬币滑入有着不同大小孔洞的轨道，每一个硬币都会掉入符合它大小的孔洞。同样地，值也会通过 "),s("code",[this._v("match")]),this._v(" 的每一个模式，并且在遇到第一个 “符合” 的模式时，值会进入相关联的代码块并在执行中被使用。")])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("因为刚刚提到了硬币，让我们用它们来作为一个使用 "),s("code",[this._v("match")]),this._v(" 的例子！我们可以编写一个函数来获取一个未知的（美帝）硬币，并以一种类似验钞机的方式，确定它是何种硬币并返回它的美分值，如示例 6-3 中所示：")])},function(){var t=this,s=t.$createElement,n=t._self._c||s;return n("div",{staticClass:"language-rust extra-class"},[n("pre",{pre:!0,attrs:{class:"language-rust"}},[n("code",[n("span",{attrs:{class:"token keyword"}},[t._v("enum")]),t._v(" Coin "),n("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    Penny"),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    Nickel"),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    Dime"),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    Quarter"),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n"),n("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\n"),n("span",{attrs:{class:"token keyword"}},[t._v("fn")]),t._v(" "),n("span",{attrs:{class:"token function"}},[t._v("value_in_cents")]),n("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("coin"),n("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" Coin"),n("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{attrs:{class:"token punctuation"}},[t._v("->")]),t._v(" u32 "),n("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),n("span",{attrs:{class:"token keyword"}},[t._v("match")]),t._v(" coin "),n("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        Coin"),n("span",{attrs:{class:"token punctuation"}},[t._v(":")]),n("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v("Penny "),n("span",{attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("1")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n        Coin"),n("span",{attrs:{class:"token punctuation"}},[t._v(":")]),n("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v("Nickel "),n("span",{attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("5")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n        Coin"),n("span",{attrs:{class:"token punctuation"}},[t._v(":")]),n("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v("Dime "),n("span",{attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("10")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n        Coin"),n("span",{attrs:{class:"token punctuation"}},[t._v(":")]),n("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v("Quarter "),n("span",{attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("25")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    "),n("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),n("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[s("span",{staticClass:"caption"},[this._v("示例 6-3：一个枚举和一个以枚举成员作为模式的 "),s("code",[this._v("match")]),this._v(" 表达式")])])},function(){var t=this,s=t.$createElement,n=t._self._c||s;return n("p",[t._v("拆开 "),n("code",[t._v("value_in_cents")]),t._v(" 函数中的 "),n("code",[t._v("match")]),t._v(" 来看。首先，我们列出 "),n("code",[t._v("match")]),t._v(" 关键字后跟一个表达式，在这个例子中是 "),n("code",[t._v("coin")]),t._v(" 的值。这看起来非常像 "),n("code",[t._v("if")]),t._v(" 使用的表达式，不过这里有一个非常大的区别：对于 "),n("code",[t._v("if")]),t._v("，表达式必须返回一个布尔值，而这里它可以是任何类型的。例子中的 "),n("code",[t._v("coin")]),t._v(" 的类型是示例 6-3 中定义的 "),n("code",[t._v("Coin")]),t._v(" 枚举。")])},function(){var t=this,s=t.$createElement,n=t._self._c||s;return n("p",[t._v("接下来是 "),n("code",[t._v("match")]),t._v(" 的分支。一个分支有两个部分：一个模式和一些代码。第一个分支的模式是值 "),n("code",[t._v("Coin::Penny")]),t._v(" 而之后的 "),n("code",[t._v("=>")]),t._v(" 运算符将模式和将要运行的代码分开。这里的代码就仅仅是值 "),n("code",[t._v("1")]),t._v("。每一个分支之间使用逗号分隔。")])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("当 "),s("code",[this._v("match")]),this._v(" 表达式执行时，它将结果值按顺序与每一个分支的模式相比较。如果模式匹配了这个值，这个模式相关联的代码将被执行。如果模式并不匹配这个值，将继续执行下一个分支，非常类似一个硬币分类器。可以拥有任意多的分支：示例 6-3 中的 "),s("code",[this._v("match")]),this._v(" 有四个分支。")])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("每个分支相关联的代码是一个表达式，而表达式的结果值将作为整个 "),s("code",[this._v("match")]),this._v(" 表达式的返回值。")])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("如果分支代码较短的话通常不使用大括号，正如示例 6-3 中的每个分支都只是返回一个值。如果想要在分支中运行多行代码，可以使用大括号。例如，如下代码在每次使用"),s("code",[this._v("Coin::Penny")]),this._v(" 调用时都会打印出 “Lucky penny!”，同时仍然返回代码块最后的值，"),s("code",[this._v("1")]),this._v("：")])},function(){var t=this,s=t.$createElement,n=t._self._c||s;return n("div",{staticClass:"language-rust extra-class"},[n("pre",{pre:!0,attrs:{class:"language-rust"}},[n("code",[t._v("# "),n("span",{attrs:{class:"token keyword"}},[t._v("enum")]),t._v(" Coin "),n("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n#    Penny"),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n#    Nickel"),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n#    Dime"),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n#    Quarter"),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n# "),n("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n#\n"),n("span",{attrs:{class:"token keyword"}},[t._v("fn")]),t._v(" "),n("span",{attrs:{class:"token function"}},[t._v("value_in_cents")]),n("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("coin"),n("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" Coin"),n("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{attrs:{class:"token punctuation"}},[t._v("->")]),t._v(" u32 "),n("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),n("span",{attrs:{class:"token keyword"}},[t._v("match")]),t._v(" coin "),n("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        Coin"),n("span",{attrs:{class:"token punctuation"}},[t._v(":")]),n("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v("Penny "),n("span",{attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),n("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n            "),n("span",{attrs:{class:"token function"}},[t._v("println!")]),n("span",{attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{attrs:{class:"token string"}},[t._v('"Lucky penny!"')]),n("span",{attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n            "),n("span",{attrs:{class:"token number"}},[t._v("1")]),t._v("\n        "),n("span",{attrs:{class:"token punctuation"}},[t._v("}")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n        Coin"),n("span",{attrs:{class:"token punctuation"}},[t._v(":")]),n("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v("Nickel "),n("span",{attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("5")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n        Coin"),n("span",{attrs:{class:"token punctuation"}},[t._v(":")]),n("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v("Dime "),n("span",{attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("10")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n        Coin"),n("span",{attrs:{class:"token punctuation"}},[t._v(":")]),n("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v("Quarter "),n("span",{attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("25")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    "),n("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),n("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])])},function(){var t=this.$createElement,s=this._self._c||t;return s("h3",{attrs:{id:"绑定值的模式"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#绑定值的模式","aria-hidden":"true"}},[this._v("#")]),this._v(" 绑定值的模式")])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("作为一个例子，让我们修改枚举的一个成员来存放数据。1999 年到 2008 年间，美帝在 25 美分的硬币的一侧为 50 个州的每一个都印刷了不同的设计。其他的硬币都没有这种区分州的设计，所以只有这些 25 美分硬币有特殊的价值。可以将这些信息加入我们的 "),s("code",[this._v("enum")]),this._v("，通过改变 "),s("code",[this._v("Quarter")]),this._v(" 成员来包含一个 "),s("code",[this._v("State")]),this._v(" 值，示例 6-4 中完成了这些修改：")])},function(){var t=this,s=t.$createElement,n=t._self._c||s;return n("div",{staticClass:"language-rust extra-class"},[n("pre",{pre:!0,attrs:{class:"language-rust"}},[n("code",[n("span",{attrs:{class:"token attribute attr-name"}},[t._v("#[derive(Debug)]")]),t._v(" "),n("span",{attrs:{class:"token comment"}},[t._v("// 这样可以可以立刻看到州的名称")]),t._v("\n"),n("span",{attrs:{class:"token keyword"}},[t._v("enum")]),t._v(" UsState "),n("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    Alabama"),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    Alaska"),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    "),n("span",{attrs:{class:"token comment"}},[t._v("// --snip--")]),t._v("\n"),n("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\n"),n("span",{attrs:{class:"token keyword"}},[t._v("enum")]),t._v(" Coin "),n("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    Penny"),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    Nickel"),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    Dime"),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    "),n("span",{attrs:{class:"token function"}},[t._v("Quarter")]),n("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("UsState"),n("span",{attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n"),n("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[s("span",{staticClass:"caption"},[this._v("示例 6-4："),s("code",[this._v("Quarter")]),this._v(" 成员也存放了一个 "),s("code",[this._v("UsState")]),this._v(" 值的 "),s("code",[this._v("Coin")]),this._v(" 枚举")])])},function(){var t=this,s=t.$createElement,n=t._self._c||s;return n("p",[t._v("在这些代码的匹配表达式中，我们在匹配 "),n("code",[t._v("Coin::Quarter")]),t._v(" 成员的分支的模式中增加了一个叫做 "),n("code",[t._v("state")]),t._v(" 的变量。当匹配到 "),n("code",[t._v("Coin::Quarter")]),t._v(" 时，变量 "),n("code",[t._v("state")]),t._v(" 将会绑定 25 美分硬币所对应州的值。接着在那个分支的代码中使用 "),n("code",[t._v("state")]),t._v("，如下：")])},function(){var t=this,s=t.$createElement,n=t._self._c||s;return n("div",{staticClass:"language-rust extra-class"},[n("pre",{pre:!0,attrs:{class:"language-rust"}},[n("code",[t._v("# "),n("span",{attrs:{class:"token attribute attr-name"}},[t._v("#[derive(Debug)]")]),t._v("\n# "),n("span",{attrs:{class:"token keyword"}},[t._v("enum")]),t._v(" UsState "),n("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n#    Alabama"),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n#    Alaska"),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n# "),n("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n#\n# "),n("span",{attrs:{class:"token keyword"}},[t._v("enum")]),t._v(" Coin "),n("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n#    Penny"),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n#    Nickel"),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n#    Dime"),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n#    "),n("span",{attrs:{class:"token function"}},[t._v("Quarter")]),n("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("UsState"),n("span",{attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n# "),n("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n#\n"),n("span",{attrs:{class:"token keyword"}},[t._v("fn")]),t._v(" "),n("span",{attrs:{class:"token function"}},[t._v("value_in_cents")]),n("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("coin"),n("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" Coin"),n("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{attrs:{class:"token punctuation"}},[t._v("->")]),t._v(" u32 "),n("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),n("span",{attrs:{class:"token keyword"}},[t._v("match")]),t._v(" coin "),n("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        Coin"),n("span",{attrs:{class:"token punctuation"}},[t._v(":")]),n("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v("Penny "),n("span",{attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("1")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n        Coin"),n("span",{attrs:{class:"token punctuation"}},[t._v(":")]),n("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v("Nickel "),n("span",{attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("5")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n        Coin"),n("span",{attrs:{class:"token punctuation"}},[t._v(":")]),n("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v("Dime "),n("span",{attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("10")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n        Coin"),n("span",{attrs:{class:"token punctuation"}},[t._v(":")]),n("span",{attrs:{class:"token punctuation"}},[t._v(":")]),n("span",{attrs:{class:"token function"}},[t._v("Quarter")]),n("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("state"),n("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),n("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n            "),n("span",{attrs:{class:"token function"}},[t._v("println!")]),n("span",{attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{attrs:{class:"token string"}},[t._v('"State quarter from {:?}!"')]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" state"),n("span",{attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n            "),n("span",{attrs:{class:"token number"}},[t._v("25")]),t._v("\n        "),n("span",{attrs:{class:"token punctuation"}},[t._v("}")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    "),n("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),n("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])])},function(){var t=this,s=t.$createElement,n=t._self._c||s;return n("p",[t._v("如果调用 "),n("code",[t._v("value_in_cents(Coin::Quarter(UsState::Alaska))")]),t._v("，"),n("code",[t._v("coin")]),t._v(" 将是 "),n("code",[t._v("Coin::Quarter(UsState::Alaska)")]),t._v("。当将值与每个分支相比较时，没有分支会匹配，直到遇到 "),n("code",[t._v("Coin::Quarter(state)")]),t._v("。这时，"),n("code",[t._v("state")]),t._v(" 绑定的将会是值 "),n("code",[t._v("UsState::Alaska")]),t._v("。接着就可以在 "),n("code",[t._v("println!")]),t._v(" 表达式中使用这个绑定了，像这样就可以获取 "),n("code",[t._v("Coin")]),t._v(" 枚举的 "),n("code",[t._v("Quarter")]),t._v(" 成员中内部的州的值。")])},function(){var t=this.$createElement,s=this._self._c||t;return s("h3",{attrs:{id:"匹配-option-t"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#匹配-option-t","aria-hidden":"true"}},[this._v("#")]),this._v(" 匹配 "),s("code",[this._v("Option<T>")])])},function(){var t=this,s=t.$createElement,n=t._self._c||s;return n("p",[t._v("我们在之前的部分中使用 "),n("code",[t._v("Option<T>")]),t._v(" 时，是为了从 "),n("code",[t._v("Some")]),t._v(" 中取出其内部的 "),n("code",[t._v("T")]),t._v(" 值；我们还可以像处理 "),n("code",[t._v("Coin")]),t._v(" 枚举那样使用 "),n("code",[t._v("match")]),t._v(" 处理 "),n("code",[t._v("Option<T>")]),t._v("！与其直接比较硬币，我们将比较 "),n("code",[t._v("Option<T>")]),t._v(" 的成员，不过 "),n("code",[t._v("match")]),t._v(" 表达式的工作方式保持不变。")])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("比如我们想要编写一个函数，它获取一个 "),s("code",[this._v("Option<i32>")]),this._v(" 并且如果其中有一个值，将其加一。如果其中没有值，函数应该返回 "),s("code",[this._v("None")]),this._v(" 值并不尝试执行任何操作。")])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("得益于 "),s("code",[this._v("match")]),this._v("，编写这个函数非常简单，它将看起来像示例 6-5 中这样：")])},function(){var t=this,s=t.$createElement,n=t._self._c||s;return n("div",{staticClass:"language-rust extra-class"},[n("pre",{pre:!0,attrs:{class:"language-rust"}},[n("code",[n("span",{attrs:{class:"token keyword"}},[t._v("fn")]),t._v(" "),n("span",{attrs:{class:"token function"}},[t._v("plus_one")]),n("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("x"),n("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" Option"),n("span",{attrs:{class:"token operator"}},[t._v("<")]),t._v("i32"),n("span",{attrs:{class:"token operator"}},[t._v(">")]),n("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{attrs:{class:"token punctuation"}},[t._v("->")]),t._v(" Option"),n("span",{attrs:{class:"token operator"}},[t._v("<")]),t._v("i32"),n("span",{attrs:{class:"token operator"}},[t._v(">")]),t._v(" "),n("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),n("span",{attrs:{class:"token keyword"}},[t._v("match")]),t._v(" x "),n("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        None "),n("span",{attrs:{class:"token operator"}},[t._v("=>")]),t._v(" None"),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n        "),n("span",{attrs:{class:"token function"}},[t._v("Some")]),n("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("i"),n("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),n("span",{attrs:{class:"token function"}},[t._v("Some")]),n("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("i "),n("span",{attrs:{class:"token operator"}},[t._v("+")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("1")]),n("span",{attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    "),n("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),n("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\n"),n("span",{attrs:{class:"token keyword"}},[t._v("let")]),t._v(" five "),n("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),n("span",{attrs:{class:"token function"}},[t._v("Some")]),n("span",{attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{attrs:{class:"token number"}},[t._v("5")]),n("span",{attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),n("span",{attrs:{class:"token keyword"}},[t._v("let")]),t._v(" six "),n("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),n("span",{attrs:{class:"token function"}},[t._v("plus_one")]),n("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("five"),n("span",{attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),n("span",{attrs:{class:"token keyword"}},[t._v("let")]),t._v(" none "),n("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),n("span",{attrs:{class:"token function"}},[t._v("plus_one")]),n("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("None"),n("span",{attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[s("span",{staticClass:"caption"},[this._v("示例 6-5：一个在 "),s("code",[this._v("Option<i32>")]),this._v(" 上使用 "),s("code",[this._v("match")]),this._v(" 表达式的函数")])])},function(){var t=this.$createElement,s=this._self._c||t;return s("h4",{attrs:{id:"匹配-some-t"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#匹配-some-t","aria-hidden":"true"}},[this._v("#")]),this._v(" 匹配 "),s("code",[this._v("Some(T)")])])},function(){var t=this,s=t.$createElement,n=t._self._c||s;return n("p",[t._v("让我们更仔细地检查 "),n("code",[t._v("plus_one")]),t._v(" 的第一行操作。当调用 "),n("code",[t._v("plus_one(five)")]),t._v(" 时，"),n("code",[t._v("plus_one")]),t._v(" 函数体中的 "),n("code",[t._v("x")]),t._v(" 将会是值 "),n("code",[t._v("Some(5)")]),t._v("。接着将其与每个分支比较。")])},function(){var t=this.$createElement,s=this._self._c||t;return s("div",{staticClass:"language-rust,ignore extra-class"},[s("pre",{pre:!0,attrs:{class:"language-text"}},[s("code",[this._v("None => None,\n")])])])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("值 "),s("code",[this._v("Some(5)")]),this._v(" 并不匹配模式 "),s("code",[this._v("None")]),this._v("，所以继续进行下一个分支。")])},function(){var t=this.$createElement,s=this._self._c||t;return s("div",{staticClass:"language-rust,ignore extra-class"},[s("pre",{pre:!0,attrs:{class:"language-text"}},[s("code",[this._v("Some(i) => Some(i + 1),\n")])])])},function(){var t=this,s=t.$createElement,n=t._self._c||s;return n("p",[n("code",[t._v("Some(5)")]),t._v(" 与 "),n("code",[t._v("Some(i)")]),t._v(" 匹配吗？当然匹配！它们是相同的成员。"),n("code",[t._v("i")]),t._v(" 绑定了 "),n("code",[t._v("Some")]),t._v(" 中包含的值，所以 "),n("code",[t._v("i")]),t._v(" 的值是 "),n("code",[t._v("5")]),t._v("。接着匹配分支的代码被执行，所以我们将 "),n("code",[t._v("i")]),t._v(" 的值加一并返回一个含有值 "),n("code",[t._v("6")]),t._v(" 的新 "),n("code",[t._v("Some")]),t._v("。")])},function(){var t=this,s=t.$createElement,n=t._self._c||s;return n("p",[t._v("接着考虑下示例 6-5 中 "),n("code",[t._v("plus_one")]),t._v(" 的第二个调用，这里 "),n("code",[t._v("x")]),t._v(" 是 "),n("code",[t._v("None")]),t._v("。我们进入 "),n("code",[t._v("match")]),t._v(" 并与第一个分支相比较。")])},function(){var t=this.$createElement,s=this._self._c||t;return s("div",{staticClass:"language-rust,ignore extra-class"},[s("pre",{pre:!0,attrs:{class:"language-text"}},[s("code",[this._v("None => None,\n")])])])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("匹配上了！这里没有值来加一，所以程序结束并返回 "),s("code",[this._v("=>")]),this._v(" 右侧的值 "),s("code",[this._v("None")]),this._v("，因为第一个分支就匹配到了，其他的分支将不再比较。")])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("将 "),s("code",[this._v("match")]),this._v(" 与枚举相结合在很多场景中都是有用的。你会在 Rust 代码中看到很多这样的模式："),s("code",[this._v("match")]),this._v(" 一个枚举，绑定其中的值到一个变量，接着根据其值执行代码。这在一开始有点复杂，不过一旦习惯了，你会希望所有语言都拥有它！这一直是用户的最爱。")])},function(){var t=this.$createElement,s=this._self._c||t;return s("h3",{attrs:{id:"匹配是穷尽的"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#匹配是穷尽的","aria-hidden":"true"}},[this._v("#")]),this._v(" 匹配是穷尽的")])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[s("code",[this._v("match")]),this._v(" 还有另一方面需要讨论。考虑一下 "),s("code",[this._v("plus_one")]),this._v(" 函数的这个版本，它有一个 bug 并不能编译：")])},function(){var t=this.$createElement,s=this._self._c||t;return s("div",{staticClass:"language-rust,ignore,does_not_compile extra-class"},[s("pre",{pre:!0,attrs:{class:"language-text"}},[s("code",[this._v("fn plus_one(x: Option<i32>) -> Option<i32> {\n    match x {\n        Some(i) => Some(i + 1),\n    }\n}\n")])])])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("我们没有处理 "),s("code",[this._v("None")]),this._v(" 的情况，所以这些代码会造成一个 bug。幸运的是，这是一个 Rust 知道如何处理的 bug。如果尝试编译这段代码，会得到这个错误：")])},function(){var t=this.$createElement,s=this._self._c||t;return s("div",{staticClass:"language-text extra-class"},[s("pre",{pre:!0,attrs:{class:"language-text"}},[s("code",[this._v("error[E0004]: non-exhaustive patterns: `None` not covered\n --\x3e\n  |\n6 |         match x {\n  |               ^ pattern `None` not covered\n")])])])},function(){var t=this,s=t.$createElement,n=t._self._c||s;return n("p",[t._v("Rust 知道我们没有覆盖所有可能的情况甚至知道哪些模式被忘记了！Rust 中的匹配是 "),n("strong",[t._v("穷尽的")]),t._v("（"),n("em",[t._v("exhaustive")]),t._v("）：必须穷举到最后的可能性来使代码有效。特别的在这个 "),n("code",[t._v("Option<T>")]),t._v(" 的例子中，Rust 防止我们忘记明确的处理 "),n("code",[t._v("None")]),t._v(" 的情况，这使我们免于假设拥有一个实际上为空的值，这造成了之前提到过的价值亿万的错误。")])},function(){var t=this.$createElement,s=this._self._c||t;return s("h3",{attrs:{id:"通配符"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#通配符","aria-hidden":"true"}},[this._v("#")]),this._v(" "),s("code",[this._v("_")]),this._v(" 通配符")])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("Rust 也提供了一个模式用于不想列举出所有可能值的场景。例如，"),s("code",[this._v("u8")]),this._v(" 可以拥有 0 到 255 的有效的值，如果我们只关心 1、3、5 和 7 这几个值，就并不想必须列出 0、2、4、6、8、9 一直到 255 的值。所幸我们不必这么做：可以使用特殊的模式 "),s("code",[this._v("_")]),this._v(" 替代：")])},function(){var t=this,s=t.$createElement,n=t._self._c||s;return n("div",{staticClass:"language-rust extra-class"},[n("pre",{pre:!0,attrs:{class:"language-rust"}},[n("code",[n("span",{attrs:{class:"token keyword"}},[t._v("let")]),t._v(" some_u8_value "),n("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("0u8")]),n("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),n("span",{attrs:{class:"token keyword"}},[t._v("match")]),t._v(" some_u8_value "),n("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),n("span",{attrs:{class:"token number"}},[t._v("1")]),t._v(" "),n("span",{attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),n("span",{attrs:{class:"token function"}},[t._v("println!")]),n("span",{attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{attrs:{class:"token string"}},[t._v('"one"')]),n("span",{attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    "),n("span",{attrs:{class:"token number"}},[t._v("3")]),t._v(" "),n("span",{attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),n("span",{attrs:{class:"token function"}},[t._v("println!")]),n("span",{attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{attrs:{class:"token string"}},[t._v('"three"')]),n("span",{attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    "),n("span",{attrs:{class:"token number"}},[t._v("5")]),t._v(" "),n("span",{attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),n("span",{attrs:{class:"token function"}},[t._v("println!")]),n("span",{attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{attrs:{class:"token string"}},[t._v('"five"')]),n("span",{attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    "),n("span",{attrs:{class:"token number"}},[t._v("7")]),t._v(" "),n("span",{attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),n("span",{attrs:{class:"token function"}},[t._v("println!")]),n("span",{attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{attrs:{class:"token string"}},[t._v('"seven"')]),n("span",{attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    _ "),n("span",{attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),n("span",{attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n"),n("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])])},function(){var t=this,s=t.$createElement,n=t._self._c||s;return n("p",[n("code",[t._v("_")]),t._v(" 模式会匹配所有的值。通过将其放置于其他分支之后，"),n("code",[t._v("_")]),t._v(" 将会匹配所有之前没有指定的可能的值。"),n("code",[t._v("()")]),t._v(" 就是 unit 值，所以 "),n("code",[t._v("_")]),t._v(" 的情况什么也不会发生。因此，可以说我们想要对 "),n("code",[t._v("_")]),t._v(" 通配符之前没有列出的所有可能的值不做任何处理。")])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("然而，"),s("code",[this._v("match")]),this._v(" 在只关心 "),s("strong",[this._v("一个")]),this._v(" 情况的场景中可能就有点啰嗦了。为此 Rust 提供了"),s("code",[this._v("if let")]),this._v("。")])}],!1,null,null,null);e.options.__file="ch06-02-match.md";s.default=e.exports}}]);