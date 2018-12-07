(window.webpackJsonp=window.webpackJsonp||[]).push([[51],{219:function(t,s,n){"use strict";n.r(s);var a=n(0),e=Object(a.a)({},function(){var t=this,s=t.$createElement,n=t._self._c||s;return n("div",{staticClass:"content"},[t._m(0),t._v(" "),n("blockquote",[n("p",[n("a",{attrs:{href:"https://github.com/rust-lang/book/blob/master/src/ch10-00-generics.md",target:"_blank",rel:"noopener noreferrer"}},[t._v("ch10-00-generics.md"),n("OutboundLink")],1),t._v(" "),n("br"),t._v("\ncommit 1fedfc4b96c2017f64ecfcf41a0a07e2e815f24f")])]),t._v(" "),t._m(1),t._v(" "),t._m(2),t._v(" "),n("p",[t._v("首先，我们将回顾一下提取函数以减少代码重复的机制。接着使用一个只在参数类型上不同的泛型函数来实现相同的功能。我们也会讲到结构体和枚举定义中的泛型。")]),t._v(" "),t._m(3),t._v(" "),t._m(4),t._v(" "),t._m(5),t._v(" "),n("p",[t._v("在介绍泛型语法之前，首先来回顾一个不使用泛型的处理重复的技术：提取一个函数。当熟悉了这个技术以后，我们将使用相同的机制来提取一个泛型函数！如同你识别出可以提取到函数中重复代码那样，你也会开始识别出能够使用泛型的重复代码。")]),t._v(" "),n("p",[t._v("考虑一下这个寻找列表中最大值的小程序，如示例 10-1 所示：")]),t._v(" "),t._m(6),t._v(" "),t._m(7),t._m(8),t._v(" "),t._m(9),t._v(" "),n("p",[t._v("如果需要在两个不同的列表中寻找最大值，我们可以重复示例 10-1 中的代码，这样程序中就会存在两段相同逻辑的代码，如示例 10-2 所示：")]),t._v(" "),t._m(10),t._v(" "),t._m(11),t._m(12),t._v(" "),n("p",[t._v("虽然代码能够执行，但是重复的代码是冗余且容易出错的，并且意味着当更新逻辑时需要修改多处地方的代码。")]),t._v(" "),n("p",[t._v("为了消除重复，我们可以创建一层抽象，在这个例子中将表现为一个获取任意整型列表作为参数并对其进行处理的函数。这将增加代码的简洁性并让我们将表达和推导寻找列表中最大值的这个概念与使用这个概念的特定位置相互独立。")]),t._v(" "),t._m(13),t._v(" "),t._m(14),t._v(" "),t._m(15),t._m(16),t._v(" "),t._m(17),t._v(" "),n("p",[t._v("从示例 10-2 到示例 10-3 中涉及的机制经历了如下几步：")]),t._v(" "),t._m(18),t._v(" "),t._m(19),t._v(" "),t._m(20)])},[function(){var t=this.$createElement,s=this._self._c||t;return s("h1",{attrs:{id:"泛型、trait-和生命周期"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#泛型、trait-和生命周期","aria-hidden":"true"}},[this._v("#")]),this._v(" 泛型、trait 和生命周期")])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("每一个编程语言都有高效的处理重复概念的工具.在 Rust 中其工具之一就是 "),s("strong",[this._v("泛型")]),this._v("（"),s("em",[this._v("generics")]),this._v("）。泛型是具体类型或其他属性的抽象替代。我们可以表达泛型的属性，比如他们的行为或如何与其他泛型相关联，而不需要在编写和编译代码时知道他们在这里实际上代表什么。")])},function(){var t=this,s=t.$createElement,n=t._self._c||s;return n("p",[t._v("同理为了编写一份可以用于多种具体值的代码，函数并不知道其参数为何值，这时就可以让函数获取泛型而不是像 "),n("code",[t._v("i32")]),t._v(" 或 "),n("code",[t._v("String")]),t._v(" 这样的具体值。我们已经使用过第六章的 "),n("code",[t._v("Option<T>")]),t._v("，第八章的 "),n("code",[t._v("Vec<T>")]),t._v(" 和 "),n("code",[t._v("HashMap<K, V>")]),t._v("，以及第九章的 "),n("code",[t._v("Result<T, E>")]),t._v(" 这些泛型了。本章会探索如何使用泛型定义我们自己的类型、函数和方法！")])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("之后，我们讨论 "),s("em",[this._v("trait")]),this._v("，这是一个定义泛型行为的方法。trait 可以与泛型结合来将泛型限制为拥有特定行为的类型，而不是任意类型。")])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("最后介绍 "),s("strong",[this._v("生命周期")]),this._v("（"),s("em",[this._v("lifetimes")]),this._v("），它是一类允许我们向编译器提供引用如何相互关联的泛型。Rust 的生命周期功能允许在很多场景下借用值的同时仍然使编译器能够检查这些引用的有效性。")])},function(){var t=this.$createElement,s=this._self._c||t;return s("h2",{attrs:{id:"提取函数来减少重复"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#提取函数来减少重复","aria-hidden":"true"}},[this._v("#")]),this._v(" 提取函数来减少重复")])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[s("span",{staticClass:"filename"},[this._v("文件名: src/main.rs")])])},function(){var t=this,s=t.$createElement,n=t._self._c||s;return n("div",{staticClass:"language-rust extra-class"},[n("pre",{pre:!0,attrs:{class:"language-rust"}},[n("code",[n("span",{attrs:{class:"token keyword"}},[t._v("fn")]),t._v(" "),n("span",{attrs:{class:"token function"}},[t._v("main")]),n("span",{attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),n("span",{attrs:{class:"token keyword"}},[t._v("let")]),t._v(" number_list "),n("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),n("span",{attrs:{class:"token function"}},[t._v("vec!")]),n("span",{attrs:{class:"token punctuation"}},[t._v("[")]),n("span",{attrs:{class:"token number"}},[t._v("34")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("50")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("25")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("100")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("65")]),n("span",{attrs:{class:"token punctuation"}},[t._v("]")]),n("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n    "),n("span",{attrs:{class:"token keyword"}},[t._v("let")]),t._v(" "),n("span",{attrs:{class:"token keyword"}},[t._v("mut")]),t._v(" largest "),n("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" number_list"),n("span",{attrs:{class:"token punctuation"}},[t._v("[")]),n("span",{attrs:{class:"token number"}},[t._v("0")]),n("span",{attrs:{class:"token punctuation"}},[t._v("]")]),n("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n    "),n("span",{attrs:{class:"token keyword"}},[t._v("for")]),t._v(" number "),n("span",{attrs:{class:"token keyword"}},[t._v("in")]),t._v(" number_list "),n("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),n("span",{attrs:{class:"token keyword"}},[t._v("if")]),t._v(" number "),n("span",{attrs:{class:"token operator"}},[t._v(">")]),t._v(" largest "),n("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n            largest "),n("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" number"),n("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n        "),n("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    "),n("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\n    "),n("span",{attrs:{class:"token function"}},[t._v("println!")]),n("span",{attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{attrs:{class:"token string"}},[t._v('"The largest number is {}"')]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" largest"),n("span",{attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n#  "),n("span",{attrs:{class:"token function"}},[t._v("assert_eq!")]),n("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("largest"),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("100")]),n("span",{attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),n("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[s("span",{staticClass:"caption"},[this._v("示例 10-1：在一个数字列表中寻找最大值的函数")])])},function(){var t=this,s=t.$createElement,n=t._self._c||s;return n("p",[t._v("这段代码获取一个整型列表，存放在变量 "),n("code",[t._v("number_list")]),t._v(" 中。它将列表的第一项放入了变量 "),n("code",[t._v("largest")]),t._v(" 中。接着遍历了列表中的所有数字，如果当前值大于 "),n("code",[t._v("largest")]),t._v(" 中储存的值，将 "),n("code",[t._v("largest")]),t._v(" 替换为这个值。如果当前值小于目前为止的最大值，"),n("code",[t._v("largest")]),t._v(" 保持不变。当列表中所有值都被考虑到之后，"),n("code",[t._v("largest")]),t._v(" 将会是最大值，在这里也就是 100。")])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[s("span",{staticClass:"filename"},[this._v("文件名: src/main.rs")])])},function(){var t=this,s=t.$createElement,n=t._self._c||s;return n("div",{staticClass:"language-rust extra-class"},[n("pre",{pre:!0,attrs:{class:"language-rust"}},[n("code",[n("span",{attrs:{class:"token keyword"}},[t._v("fn")]),t._v(" "),n("span",{attrs:{class:"token function"}},[t._v("main")]),n("span",{attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),n("span",{attrs:{class:"token keyword"}},[t._v("let")]),t._v(" number_list "),n("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),n("span",{attrs:{class:"token function"}},[t._v("vec!")]),n("span",{attrs:{class:"token punctuation"}},[t._v("[")]),n("span",{attrs:{class:"token number"}},[t._v("34")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("50")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("25")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("100")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("65")]),n("span",{attrs:{class:"token punctuation"}},[t._v("]")]),n("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n    "),n("span",{attrs:{class:"token keyword"}},[t._v("let")]),t._v(" "),n("span",{attrs:{class:"token keyword"}},[t._v("mut")]),t._v(" largest "),n("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" number_list"),n("span",{attrs:{class:"token punctuation"}},[t._v("[")]),n("span",{attrs:{class:"token number"}},[t._v("0")]),n("span",{attrs:{class:"token punctuation"}},[t._v("]")]),n("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n    "),n("span",{attrs:{class:"token keyword"}},[t._v("for")]),t._v(" number "),n("span",{attrs:{class:"token keyword"}},[t._v("in")]),t._v(" number_list "),n("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),n("span",{attrs:{class:"token keyword"}},[t._v("if")]),t._v(" number "),n("span",{attrs:{class:"token operator"}},[t._v(">")]),t._v(" largest "),n("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n            largest "),n("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" number"),n("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n        "),n("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    "),n("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\n    "),n("span",{attrs:{class:"token function"}},[t._v("println!")]),n("span",{attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{attrs:{class:"token string"}},[t._v('"The largest number is {}"')]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" largest"),n("span",{attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n    "),n("span",{attrs:{class:"token keyword"}},[t._v("let")]),t._v(" number_list "),n("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),n("span",{attrs:{class:"token function"}},[t._v("vec!")]),n("span",{attrs:{class:"token punctuation"}},[t._v("[")]),n("span",{attrs:{class:"token number"}},[t._v("102")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("34")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("6000")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("89")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("54")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("2")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("43")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("8")]),n("span",{attrs:{class:"token punctuation"}},[t._v("]")]),n("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n    "),n("span",{attrs:{class:"token keyword"}},[t._v("let")]),t._v(" "),n("span",{attrs:{class:"token keyword"}},[t._v("mut")]),t._v(" largest "),n("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" number_list"),n("span",{attrs:{class:"token punctuation"}},[t._v("[")]),n("span",{attrs:{class:"token number"}},[t._v("0")]),n("span",{attrs:{class:"token punctuation"}},[t._v("]")]),n("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n    "),n("span",{attrs:{class:"token keyword"}},[t._v("for")]),t._v(" number "),n("span",{attrs:{class:"token keyword"}},[t._v("in")]),t._v(" number_list "),n("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),n("span",{attrs:{class:"token keyword"}},[t._v("if")]),t._v(" number "),n("span",{attrs:{class:"token operator"}},[t._v(">")]),t._v(" largest "),n("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n            largest "),n("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" number"),n("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n        "),n("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    "),n("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\n    "),n("span",{attrs:{class:"token function"}},[t._v("println!")]),n("span",{attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{attrs:{class:"token string"}},[t._v('"The largest number is {}"')]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" largest"),n("span",{attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),n("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[s("span",{staticClass:"caption"},[this._v("示例 10-2：寻找 "),s("strong",[this._v("两个")]),this._v(" 数字列表最大值的代码")])])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("在示例 10-3 的程序中将寻找最大值的代码提取到了一个叫做 "),s("code",[this._v("largest")]),this._v(" 的函数中。这个程序可以找出两个不同数字列表的最大值，不过示例 10-1 中的代码只存在于一个位置：")])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[s("span",{staticClass:"filename"},[this._v("文件名: src/main.rs")])])},function(){var t=this,s=t.$createElement,n=t._self._c||s;return n("div",{staticClass:"language-rust extra-class"},[n("pre",{pre:!0,attrs:{class:"language-rust"}},[n("code",[n("span",{attrs:{class:"token keyword"}},[t._v("fn")]),t._v(" "),n("span",{attrs:{class:"token function"}},[t._v("largest")]),n("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("list"),n("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),n("span",{attrs:{class:"token operator"}},[t._v("&")]),n("span",{attrs:{class:"token punctuation"}},[t._v("[")]),t._v("i32"),n("span",{attrs:{class:"token punctuation"}},[t._v("]")]),n("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{attrs:{class:"token punctuation"}},[t._v("->")]),t._v(" i32 "),n("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),n("span",{attrs:{class:"token keyword"}},[t._v("let")]),t._v(" "),n("span",{attrs:{class:"token keyword"}},[t._v("mut")]),t._v(" largest "),n("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" list"),n("span",{attrs:{class:"token punctuation"}},[t._v("[")]),n("span",{attrs:{class:"token number"}},[t._v("0")]),n("span",{attrs:{class:"token punctuation"}},[t._v("]")]),n("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n    "),n("span",{attrs:{class:"token keyword"}},[t._v("for")]),t._v(" "),n("span",{attrs:{class:"token operator"}},[t._v("&")]),t._v("item "),n("span",{attrs:{class:"token keyword"}},[t._v("in")]),t._v(" list"),n("span",{attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{attrs:{class:"token function"}},[t._v("iter")]),n("span",{attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),n("span",{attrs:{class:"token keyword"}},[t._v("if")]),t._v(" item "),n("span",{attrs:{class:"token operator"}},[t._v(">")]),t._v(" largest "),n("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n            largest "),n("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" item"),n("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n        "),n("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    "),n("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\n    largest\n"),n("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\n"),n("span",{attrs:{class:"token keyword"}},[t._v("fn")]),t._v(" "),n("span",{attrs:{class:"token function"}},[t._v("main")]),n("span",{attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),n("span",{attrs:{class:"token keyword"}},[t._v("let")]),t._v(" number_list "),n("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),n("span",{attrs:{class:"token function"}},[t._v("vec!")]),n("span",{attrs:{class:"token punctuation"}},[t._v("[")]),n("span",{attrs:{class:"token number"}},[t._v("34")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("50")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("25")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("100")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("65")]),n("span",{attrs:{class:"token punctuation"}},[t._v("]")]),n("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n    "),n("span",{attrs:{class:"token keyword"}},[t._v("let")]),t._v(" result "),n("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),n("span",{attrs:{class:"token function"}},[t._v("largest")]),n("span",{attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{attrs:{class:"token operator"}},[t._v("&")]),t._v("number_list"),n("span",{attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),n("span",{attrs:{class:"token function"}},[t._v("println!")]),n("span",{attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{attrs:{class:"token string"}},[t._v('"The largest number is {}"')]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" result"),n("span",{attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n#    "),n("span",{attrs:{class:"token function"}},[t._v("assert_eq!")]),n("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("result"),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("100")]),n("span",{attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n    "),n("span",{attrs:{class:"token keyword"}},[t._v("let")]),t._v(" number_list "),n("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),n("span",{attrs:{class:"token function"}},[t._v("vec!")]),n("span",{attrs:{class:"token punctuation"}},[t._v("[")]),n("span",{attrs:{class:"token number"}},[t._v("102")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("34")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("6000")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("89")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("54")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("2")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("43")]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("8")]),n("span",{attrs:{class:"token punctuation"}},[t._v("]")]),n("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n    "),n("span",{attrs:{class:"token keyword"}},[t._v("let")]),t._v(" result "),n("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),n("span",{attrs:{class:"token function"}},[t._v("largest")]),n("span",{attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{attrs:{class:"token operator"}},[t._v("&")]),t._v("number_list"),n("span",{attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),n("span",{attrs:{class:"token function"}},[t._v("println!")]),n("span",{attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{attrs:{class:"token string"}},[t._v('"The largest number is {}"')]),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" result"),n("span",{attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n#    "),n("span",{attrs:{class:"token function"}},[t._v("assert_eq!")]),n("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("result"),n("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{attrs:{class:"token number"}},[t._v("6000")]),n("span",{attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),n("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[s("span",{staticClass:"caption"},[this._v("示例 10-3：抽象后的寻找两个数字列表最大值的代码")])])},function(){var t=this,s=t.$createElement,n=t._self._c||s;return n("p",[t._v("这个函数有一个参数 "),n("code",[t._v("list")]),t._v("，它代表会传递给函数的任何具体的 "),n("code",[t._v("i32")]),t._v("值的 slice。函数定义中的 "),n("code",[t._v("list")]),t._v(" 代表任何 "),n("code",[t._v("&[i32]")]),t._v("。当调用 "),n("code",[t._v("largest")]),t._v(" 函数时，其代码实际上运行于我们传递的特定值上。")])},function(){var t=this.$createElement,s=this._self._c||t;return s("ol",[s("li",[this._v("找出重复代码。")]),this._v(" "),s("li",[this._v("将重复代码提取到了一个函数中，并在函数签名中指定了代码中的输入和返回值。")]),this._v(" "),s("li",[this._v("将重复代码的两个实例，改为调用函数。")])])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("在不同的场景使用不同的方式，我们也可以利用相同的步骤和泛型来减少重复代码。与函数体可以在抽象"),s("code",[this._v("list")]),this._v("而不是特定值上操作的方式相同，泛型允许代码对抽象类型进行操作。")])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("如果我们有两个函数，一个寻找一个 "),s("code",[this._v("i32")]),this._v(" 值的 slice 中的最大项而另一个寻找 "),s("code",[this._v("char")]),this._v(" 值的 slice 中的最大项该怎么办？该如何消除重复呢？让我们拭目以待！")])}],!1,null,null,null);e.options.__file="ch10-00-generics.md";s.default=e.exports}}]);