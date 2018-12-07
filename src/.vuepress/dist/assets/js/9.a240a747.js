(window.webpackJsonp=window.webpackJsonp||[]).push([[9],{266:function(e,t,_){"use strict";_.r(t);var s=_(0),r=Object(s.a)({},function(){var e=this,t=e.$createElement,_=e._self._c||t;return _("div",{staticClass:"content"},[e._m(0),e._v(" "),_("blockquote",[_("p",[_("a",{attrs:{href:"https://github.com/rust-lang/book/blob/master/second-edition/src/appendix-04-macros.md",target:"_blank",rel:"noopener noreferrer"}},[e._v("appendix-04-macros.md"),_("OutboundLink")],1),e._v(" "),_("br"),e._v("\ncommit 32215c1d96c9046c0b553a05fa5ec3ede2e125c3")])]),e._v(" "),e._m(1),e._v(" "),e._m(2),e._v(" "),_("p",[e._v("因为在 Rust 里宏仍在开发中，该附录会介绍宏的细节。宏已经改变了，在不久的将来，和语言的其他部分以及从 Rust 1.0 至今的标准库相比，将会以更快的速率改变，因此，和本书其他部分相比，本部分更有可能变得过时。由于 Rust 的稳定性保证，该处的代码将会在后续版本中继续可运行，但可能会以更优的性能或更容易的方式来写那些在此次发布版中无法实现的宏。当你尝试实现该附录任何功能时，请记住这一点。")]),e._v(" "),e._m(3),e._v(" "),e._m(4),e._v(" "),_("p",[e._v("元编程对于减少大量编写和维护的代码是非常有用的，它也扮演了函数的角色。但宏有一些函数所没有的附加能力。")]),e._v(" "),e._m(5),e._v(" "),_("p",[e._v("实现一个宏而不是函数的消极面是宏定义要比函数定义更复杂，因为你正在为写 Rust 代码而写代码。由于这样的间接性，宏定义通常要比函数定义更难阅读、理解以及维护。")]),e._v(" "),e._m(6),e._v(" "),e._m(7),e._m(8),e._v(" "),e._m(9),e._v(" "),e._m(10),e._v(" "),e._m(11),e._v(" "),e._m(12),e._v(" "),e._m(13),e._m(14),e._v(" "),e._m(15),e._v(" "),e._m(16),e._m(17),e._v(" "),e._m(18),e._v(" "),e._m(19),e._v(" "),e._m(20),e._v(" "),e._m(21),e._v(" "),_("p",[e._v("宏定义中有效模式语法和在第十八章提及的模式语法是不同的，因为宏模式所匹配的是 Rust 代码结构而不是值。回过头来检查下示例 D-1 中模式片段什么意思。对于全部的宏模式语法，请查阅"),_("a",{attrs:{href:"https://github.com/rust-lang/book/blob/master/reference/macros.html",target:"_blank",rel:"noopener noreferrer"}},[e._v("参考"),_("OutboundLink")],1),e._v("。")]),e._v(" "),e._m(22),e._v(" "),e._m(23),e._v(" "),e._m(24),e._v(" "),e._m(25),e._v(" "),e._m(26),_("p",[e._v("我们已经定义了一个宏，其可以接收任意数量和类型的参数，同时可以生成能够创建包含指定元素的 vector 的代码。")]),e._v(" "),_("p",[e._v("鉴于大多数 Rust 程序员"),_("em",[e._v("使用")]),e._v("宏而不是"),_("em",[e._v("写")]),e._v("宏，此处不再深入探讨 "),_("code",[e._v("macro_rules!")]),e._v(" 。请查阅在线文档或其他资源，如 "),_("a",{attrs:{href:"https://danielkeep.github.io/tlborm/book/index.html",target:"_blank",rel:"noopener noreferrer"}},[e._v("“The Little Book of Rust Macros”"),_("OutboundLink")],1),e._v(" 来更多地了解如何写宏。")]),e._v(" "),e._m(27),e._v(" "),e._m(28),e._v(" "),e._m(29),e._v(" "),e._m(30),e._v(" "),e._m(31),e._m(32),e._v(" "),e._m(33),e._v(" "),e._m(34),e._m(35),e._v(" "),e._m(36),e._v(" "),e._m(37),_("p",[e._v("现在有了一个包含函数的 trait 。此时，包用户可以实现该 trait 以达到其期望的功能，像这样：")]),e._v(" "),e._m(38),e._m(39),e._v(" "),e._m(40),e._v(" "),e._m(41),e._v(" "),e._m(42),e._m(43),e._v(" "),e._m(44),e._v(" "),e._m(45),e._v(" "),e._m(46),e._m(47),e._v(" "),e._m(48),e._v(" "),e._m(49),e._m(50),e._v(" "),e._m(51),e._v(" "),_("p",[e._v("现在，我们已经介绍了三个包："),_("code",[e._v("proc_macro")]),e._v(" 、 "),_("a",{attrs:{href:"https://crates.io/crates/syn",target:"_blank",rel:"noopener noreferrer"}},[_("code",[e._v("syn")]),_("OutboundLink")],1),e._v(" 和 "),_("a",{attrs:{href:"https://crates.io/crates/quote",target:"_blank",rel:"noopener noreferrer"}},[_("code",[e._v("quote")]),_("OutboundLink")],1),e._v(" 。Rust 自带 "),_("code",[e._v("proc_macro")]),e._v("  ，因此无需将其加到 "),_("em",[e._v("Cargo.toml")]),e._v(" 文件的依赖中。"),_("code",[e._v("proc_macro")]),e._v(" 可以将 Rust 代码转换为相应的字符串。"),_("code",[e._v("syn")]),e._v(" 则将字符串中的 Rust 代码解析成为一个可以操作的数据结构。"),_("code",[e._v("quote")]),e._v(" 则将 "),_("code",[e._v("syn")]),e._v(" 解析的数据结构反过来传入到 Rust 代码中。这些包让解析我们所要处理的有序 Rust 代码变得更简单：为 Rust 编写整个的解析器并不是一件简单的工作。")]),e._v(" "),e._m(52),e._v(" "),e._m(53),e._v(" "),e._m(54),e._v(" "),e._m(55),e._v(" "),e._m(56),_("p",[e._v("该结构体的字段展示了我们解析的 Rust 代码是一个元组结构体，其 "),_("code",[e._v("ident")]),e._v(" （ identifier，表示名字）为 "),_("code",[e._v("Pancakes")]),e._v(" 。该结构体里面有更多字段描述了所有有序 Rust 代码，查阅 "),_("a",{attrs:{href:"https://docs.rs/syn/0.11.11/syn/struct.DeriveInput.html",target:"_blank",rel:"noopener noreferrer"}},[_("code",[e._v("syn")]),e._v("\ndocumentation for "),_("code",[e._v("DeriveInput")]),_("OutboundLink")],1),e._v(" 以获取更多信息。")]),e._v(" "),e._m(57),e._v(" "),e._m(58),e._v(" "),e._m(59),e._v(" "),e._m(60),e._v(" "),e._m(61),e._m(62),e._v(" "),_("p",[_("code",[e._v("quote!")]),e._v(" 宏让我们编写我们想要返回的代码，并可以将其传入进 "),_("code",[e._v("quote::Tokens")]),e._v(" 。这个宏也提供了一些非常酷的模板机制；我们可以写 "),_("code",[e._v("#name")]),e._v(" ，然后 "),_("code",[e._v("quote!")]),e._v(" 会以 名为 "),_("code",[e._v("name")]),e._v(" 的变量值来替换它。你甚至可以做些与这个正则宏任务类似的重复事情。查阅 "),_("a",{attrs:{href:"https://docs.rs/quote",target:"_blank",rel:"noopener noreferrer"}},[e._v("the "),_("code",[e._v("quote")]),e._v(" crate’s\ndocs"),_("OutboundLink")],1),e._v(" 来获取详尽的介绍。")]),e._v(" "),e._m(63),e._v(" "),e._m(64),e._v(" "),_("p",[e._v("此时，"),_("code",[e._v("cargo build")]),e._v(" 应该都能成功编译 "),_("code",[e._v("hello_macro")]),e._v(" 和 "),_("code",[e._v("hello_macro_derive")]),e._v(" 。我们将这些 crate 连接到示例 D-2 的代码中来看看过程式宏的行为。在 "),_("em",[e._v("projects")]),e._v(" 目录下用 "),_("code",[e._v("cargo new pancakes")]),e._v(" 命令新建一个二进制项目。需要将 "),_("code",[e._v("hello_macro")]),e._v(" 和 "),_("code",[e._v("hello_macro_derive")]),e._v(" 作为依赖加到 "),_("code",[e._v("pancakes")]),e._v(" 包的 "),_("em",[e._v("Cargo.toml")]),e._v("  文件中去。如果你正将 "),_("code",[e._v("hello_macro")]),e._v(" 和 "),_("code",[e._v("hello_macro_derive")]),e._v(" 的版本发布到 "),_("a",{attrs:{href:"https://crates.io/",target:"_blank",rel:"noopener noreferrer"}},[_("em",[e._v("https://crates.io/")]),_("OutboundLink")],1),e._v(" 上，其应为正规依赖；如果不是，则可以像下面这样将其指定为 "),_("code",[e._v("path")]),e._v(" 依赖：")]),e._v(" "),e._m(65),e._m(66),e._v(" "),e._m(67),e._v(" "),e._m(68)])},[function(){var e=this.$createElement,t=this._self._c||e;return t("h2",{attrs:{id:"附录d-宏"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#附录d-宏","aria-hidden":"true"}},[this._v("#")]),this._v(" 附录D - 宏")])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[this._v("我们已经在本书中像 "),t("em",[this._v("println!")]),this._v(" 这样使用过宏了，但还没完全探索什么是宏以及它是如何工作的。本附录以如下方式解释宏：")])},function(){var e=this.$createElement,t=this._self._c||e;return t("ul",[t("li",[this._v("什么是宏以及与函数有何区别")]),this._v(" "),t("li",[this._v("如何定义一个声明式宏（ declarative macro ）来进行元编程（metaprogramming）")]),this._v(" "),t("li",[this._v("如何定义一个过程式宏（ procedural macro ）来自定义 "),t("code",[this._v("derive")]),this._v(" traits")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("h3",{attrs:{id:"宏和函数的区别"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#宏和函数的区别","aria-hidden":"true"}},[this._v("#")]),this._v(" 宏和函数的区别")])},function(){var e=this,t=e.$createElement,_=e._self._c||t;return _("p",[e._v("从根本上来说，宏是一种为写其他代码而写代码的方式，即所谓的"),_("em",[e._v("元编程")]),e._v("。在附录C中，探讨了 "),_("code",[e._v("derive")]),e._v(" 属性，其生成各种 trait 的实现。我们也在本书中使用过 "),_("code",[e._v("println!")]),e._v(" 宏和 "),_("code",[e._v("vec!")]),e._v(" 宏。所有的这些宏 "),_("em",[e._v("扩展开")]),e._v(" 来以生成比你手写更多的代码。")])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[this._v("一个函数标签必须声明函数参数个数和类型。而宏只接受一个可变参数：用一个参数调用 "),t("code",[this._v('println!("hello")')]),this._v(" 或用两个参数调用 "),t("code",[this._v('println!("hello {}", name)')]),this._v(" 。而且，宏可以在编译器翻译代码前展开，例如，宏可以在一个给定类型上实现 trait 。因为函数是在运行时被调用，同时 trait 需要在运行时实现，所以函数无法像宏这样。")])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[this._v("宏和函数的另一个区别是：宏定义无法像函数定义那样出现在模块命名空间中。当使用外部包（ external crate ）时，为了防止无法预料的名字冲突，在导入外部包的同时也必须明确地用 "),t("code",[this._v("#[macro_use]")]),this._v(" 注解将宏导入到项目中。下面的例子将所有定义在 "),t("code",[this._v("serde")]),this._v(" 包中的宏导入到当前包中：")])},function(){var e=this.$createElement,t=this._self._c||e;return t("div",{staticClass:"language-rust,ignore extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[this._v("#[macro_use]\nextern crate serde;\n")])])])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[this._v("如果 "),t("code",[this._v("extern crate")]),this._v(" 能够将宏默认导入而无需使用明确的注解，则会阻止你使用同时定义相同宏名的两个包。在练习中，这样的冲突并不经常遇到，但使用的包越多，越有可能遇到。")])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[this._v("宏和函数最重要的区别是：在一个文件中，必须在调用宏"),t("code",[this._v("之前")]),this._v("定义或导入宏，然而却可以在任意地方定义或调用函数。")])},function(){var e=this.$createElement,t=this._self._c||e;return t("h3",{attrs:{id:"通用元编程的声明式宏-macro-rules"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#通用元编程的声明式宏-macro-rules","aria-hidden":"true"}},[this._v("#")]),this._v(" 通用元编程的声明式宏 "),t("code",[this._v("macro_rules!")])])},function(){var e=this,t=e.$createElement,_=e._self._c||t;return _("p",[e._v("在 Rust 中，最广泛使用的宏形式是 "),_("em",[e._v("declarative macros")]),e._v(" 。通常也指 "),_("em",[e._v("macros by example")]),e._v(" 、"),_("em",[_("code",[e._v("macro_rules!")]),e._v(" macros")]),e._v(" 或简单的 "),_("em",[e._v("macros")]),e._v(" 。在其核心中，声明式宏使你可以写一些和 Rust 的 "),_("code",[e._v("match")]),e._v(" 表达式类似的代码。正如在第六章讨论的那样，"),_("code",[e._v("match")]),e._v(" 表达式是控制结构，其接收一个表达式，与表达式的结果进行模式匹配，然后根据模式匹配执行相关代码。宏也将一个值和包含相关代码的模式进行比较；此种情况下，该值是 Rust 源代码传递给宏的常量，而模式则与源代码结构进行比较，同时每个模式的相关代码成为传递给宏的代码"),e._v("。所有的这些都在编译时发生。")])},function(){var e=this,t=e.$createElement,_=e._self._c||t;return _("p",[e._v("可以使用 "),_("code",[e._v("macro_rules!")]),e._v(" 来定义宏。让我们通过查看 "),_("code",[e._v("vec!")]),e._v(" 宏定义来探索如何使用 "),_("code",[e._v("macro_rules!")]),e._v(" 结构。第八章讲述了如何使用 "),_("code",[e._v("vec!")]),e._v(" 宏来生成一个给定值的 vector。例如，下面的宏用三个整数创建一个 vector `：")])},function(){var e=this,t=e.$createElement,_=e._self._c||t;return _("div",{staticClass:"language-rust extra-class"},[_("pre",{pre:!0,attrs:{class:"language-rust"}},[_("code",[_("span",{attrs:{class:"token keyword"}},[e._v("let")]),e._v(" v"),_("span",{attrs:{class:"token punctuation"}},[e._v(":")]),e._v(" Vec"),_("span",{attrs:{class:"token operator"}},[e._v("<")]),e._v("u32"),_("span",{attrs:{class:"token operator"}},[e._v(">")]),e._v(" "),_("span",{attrs:{class:"token operator"}},[e._v("=")]),e._v(" "),_("span",{attrs:{class:"token function"}},[e._v("vec!")]),_("span",{attrs:{class:"token punctuation"}},[e._v("[")]),_("span",{attrs:{class:"token number"}},[e._v("1")]),_("span",{attrs:{class:"token punctuation"}},[e._v(",")]),e._v(" "),_("span",{attrs:{class:"token number"}},[e._v("2")]),_("span",{attrs:{class:"token punctuation"}},[e._v(",")]),e._v(" "),_("span",{attrs:{class:"token number"}},[e._v("3")]),_("span",{attrs:{class:"token punctuation"}},[e._v("]")]),_("span",{attrs:{class:"token punctuation"}},[e._v(";")]),e._v("\n")])])])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[this._v("也可以使用 "),t("code",[this._v("vec!")]),this._v(" 宏来构造两个整数的 vector 或五个字符串切片的 vector 。但却无法使用函数做相同的事情，因为我们无法预先知道参数值的数量和类型。")])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[this._v("在示例 D-1 中来看一个 "),t("code",[this._v("vec!")]),this._v(" 稍微简化的定义。")])},function(){var e=this,t=e.$createElement,_=e._self._c||t;return _("div",{staticClass:"language-rust extra-class"},[_("pre",{pre:!0,attrs:{class:"language-rust"}},[_("code",[_("span",{attrs:{class:"token attribute attr-name"}},[e._v("#[macro_export]")]),e._v("\n"),_("span",{attrs:{class:"token macro-rules function"}},[e._v("macro_rules!")]),e._v(" vec "),_("span",{attrs:{class:"token punctuation"}},[e._v("{")]),e._v("\n    "),_("span",{attrs:{class:"token punctuation"}},[e._v("(")]),e._v(" $"),_("span",{attrs:{class:"token punctuation"}},[e._v("(")]),e._v(" $x"),_("span",{attrs:{class:"token punctuation"}},[e._v(":")]),e._v("expr "),_("span",{attrs:{class:"token punctuation"}},[e._v(")")]),_("span",{attrs:{class:"token punctuation"}},[e._v(",")]),_("span",{attrs:{class:"token operator"}},[e._v("*")]),e._v(" "),_("span",{attrs:{class:"token punctuation"}},[e._v(")")]),e._v(" "),_("span",{attrs:{class:"token operator"}},[e._v("=>")]),e._v(" "),_("span",{attrs:{class:"token punctuation"}},[e._v("{")]),e._v("\n        "),_("span",{attrs:{class:"token punctuation"}},[e._v("{")]),e._v("\n            "),_("span",{attrs:{class:"token keyword"}},[e._v("let")]),e._v(" "),_("span",{attrs:{class:"token keyword"}},[e._v("mut")]),e._v(" temp_vec "),_("span",{attrs:{class:"token operator"}},[e._v("=")]),e._v(" Vec"),_("span",{attrs:{class:"token punctuation"}},[e._v(":")]),_("span",{attrs:{class:"token punctuation"}},[e._v(":")]),_("span",{attrs:{class:"token function"}},[e._v("new")]),_("span",{attrs:{class:"token punctuation"}},[e._v("(")]),_("span",{attrs:{class:"token punctuation"}},[e._v(")")]),_("span",{attrs:{class:"token punctuation"}},[e._v(";")]),e._v("\n            $"),_("span",{attrs:{class:"token punctuation"}},[e._v("(")]),e._v("\n                temp_vec"),_("span",{attrs:{class:"token punctuation"}},[e._v(".")]),_("span",{attrs:{class:"token function"}},[e._v("push")]),_("span",{attrs:{class:"token punctuation"}},[e._v("(")]),e._v("$x"),_("span",{attrs:{class:"token punctuation"}},[e._v(")")]),_("span",{attrs:{class:"token punctuation"}},[e._v(";")]),e._v("\n            "),_("span",{attrs:{class:"token punctuation"}},[e._v(")")]),_("span",{attrs:{class:"token operator"}},[e._v("*")]),e._v("\n            temp_vec\n        "),_("span",{attrs:{class:"token punctuation"}},[e._v("}")]),e._v("\n    "),_("span",{attrs:{class:"token punctuation"}},[e._v("}")]),_("span",{attrs:{class:"token punctuation"}},[e._v(";")]),e._v("\n"),_("span",{attrs:{class:"token punctuation"}},[e._v("}")]),e._v("\n")])])])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[t("span",{staticClass:"caption"},[this._v("示例 D-1: "),t("code",[this._v("vec!")]),this._v(" 宏定义的一个简化版本")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("blockquote",[t("p",[this._v("注意：标准库中实际定义的 "),t("code",[this._v("vec!")]),this._v(" 包括预分配适当量的内存。这部分为代码优化，为了让示例简化，此处并没有包含在内。")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[this._v("无论何时导入定义了宏的包，"),t("code",[this._v("#[macro_export]")]),this._v(" 注解说明宏应该是可用的。 如果没有 "),t("code",[this._v("#[macro_export]")]),this._v(" 注解，即使凭借包使用 "),t("code",[this._v("#[macro_use]")]),this._v(" 注解，该宏也不会导入进来，")])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[this._v("接着使用 "),t("code",[this._v("macro_rules!")]),this._v(" 进行了宏定义，且所定义的宏并"),t("em",[this._v("不带")]),this._v("感叹号。名字后跟大括号表示宏定义体，在该例中是 "),t("code",[this._v("vec")]),this._v(" 。")])},function(){var e=this,t=e.$createElement,_=e._self._c||t;return _("p",[_("code",[e._v("vec!")]),e._v(" 宏的结构和 "),_("code",[e._v("match")]),e._v(" 表达式的结构类似。此处有一个单边模式 "),_("code",[e._v("( $( $x:expr ),* )")]),e._v(" ，后跟 "),_("code",[e._v("=>")]),e._v(" 以及和模式相关的代码块。如果模式匹配，该相关代码块将被执行。假设这只是这个宏中的模式，且只有一个有效匹配，其他任何匹配都是错误的。更复杂的宏会有多个单边模式。")])},function(){var e=this,t=e.$createElement,_=e._self._c||t;return _("p",[e._v("首先，一对括号包含了全部模式。接下来是后跟一对括号的美元符号（ "),_("code",[e._v("$")]),e._v(" ），其通过替代代码捕获了符合括号内模式的值。"),_("code",[e._v("$()")]),e._v(" 内则是 "),_("code",[e._v("$x:expr")]),e._v(" ，其匹配 Rust 的任意表达式或给定 "),_("code",[e._v("$x")]),e._v(" 名字的表达式。")])},function(){var e=this,t=e.$createElement,_=e._self._c||t;return _("p",[_("code",[e._v("$()")]),e._v(" 之后的逗号说明一个逗号分隔符可以有选择的出现代码之后，这段代码与在 "),_("code",[e._v("$()")]),e._v(" 中所捕获的代码相匹配。紧随逗号之后的 "),_("code",[e._v("*")]),e._v(" 说明该模式匹配零个或多个 "),_("code",[e._v("*")]),e._v(" 之前的任何模式。")])},function(){var e=this,t=e.$createElement,_=e._self._c||t;return _("p",[e._v("当以 "),_("code",[e._v("vec![1, 2, 3];")]),e._v(" 调用宏时，"),_("code",[e._v("$x")]),e._v(" 模式与三个表达式 "),_("code",[e._v("1")]),e._v("、"),_("code",[e._v("2")]),e._v(" 和 "),_("code",[e._v("3")]),e._v(" 进行了三次匹配。")])},function(){var e=this,t=e.$createElement,_=e._self._c||t;return _("p",[e._v("现在让我们来看看这个出现在与此单边模式相关的代码块中的模式：在 "),_("code",[e._v("$()*")]),e._v(" 部分中所生成的 "),_("code",[e._v("temp_vec.push()")]),e._v(" 为在匹配到模式中的 "),_("code",[e._v("$()")]),e._v(" 每一部分而生成。"),_("code",[e._v("$x")]),e._v(" 由每个与之相匹配的表达式所替换。当以 "),_("code",[e._v("vec![1, 2, 3];")]),e._v(" 调用该宏时，替换该宏调用所生成的代码会是下面这样：")])},function(){var e=this.$createElement,t=this._self._c||e;return t("div",{staticClass:"language-rust,ignore extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[this._v("let mut temp_vec = Vec::new();\ntemp_vec.push(1);\ntemp_vec.push(2);\ntemp_vec.push(3);\ntemp_vec\n")])])])},function(){var e=this.$createElement,t=this._self._c||e;return t("h3",{attrs:{id:"自定义-derive-的过程式宏"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#自定义-derive-的过程式宏","aria-hidden":"true"}},[this._v("#")]),this._v(" 自定义 "),t("code",[this._v("derive")]),this._v(" 的过程式宏")])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[this._v("第二种形式的宏叫做"),t("em",[this._v("过程式宏")]),this._v("（ "),t("em",[this._v("procedural macros")]),this._v(" ），因为它们更像函数（一种过程类型）。过程式宏接收 Rust 代码作为输入，在这些代码上进行操作，然后产生另一些代码作为输出，而非像声明式宏那样匹配对应模式然后以另一部分代码替换当前代码。在书写部分附录时，只能定义过程式宏来使你在一个通过 "),t("code",[this._v("derive")]),this._v(" 注解来指定 trait 名的类型上实现 trait 。")])},function(){var e=this,t=e.$createElement,_=e._self._c||t;return _("p",[e._v("我们会创建一个 "),_("code",[e._v("hello_macro")]),e._v(" 包，该包定义了一个关联到 "),_("code",[e._v("hello_macro")]),e._v(" 函数并以 "),_("code",[e._v("HelloMacro")]),e._v(" 为名的trait。并非让包的用户为其每一个类型实现"),_("code",[e._v("HelloMacro")]),e._v(" trait，我们将会提供一个过程式宏以便用户可以使用 "),_("code",[e._v("#[derive(HelloMacro)]")]),e._v(" 注解他们的类型来得到 "),_("code",[e._v("hello_macro")]),e._v(" 函数的默认实现。该函数的默认实现会打印 "),_("code",[e._v("Hello, Macro! My name is TypeName!")]),e._v("，其中 "),_("code",[e._v("TypeName")]),e._v(" 为定义了 trait 的类型名。换言之，我们会创建一个包，让使用该包的程序员能够写类似示例 D-2 中的代码。")])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[t("span",{staticClass:"filename"},[this._v("文件名: src/main.rs")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("div",{staticClass:"language-rust,ignore extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[this._v("extern crate hello_macro;\n#[macro_use]\nextern crate hello_macro_derive;\n\nuse hello_macro::HelloMacro;\n\n#[derive(HelloMacro)]\nstruct Pancakes;\n\nfn main() {\n    Pancakes::hello_macro();\n}\n")])])])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[t("span",{staticClass:"caption"},[this._v("示例 D-2: 包用户所写的能够使用过程式宏的代码")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[this._v("运行该代码将会打印 "),t("code",[this._v("Hello, Macro! My name is Pancakes!")]),this._v(" 第一步是像下面这样新建一个库：")])},function(){var e=this.$createElement,t=this._self._c||e;return t("div",{staticClass:"language-text extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[this._v("$ cargo new hello_macro --lib\n")])])])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[this._v("接下来，会定义 "),t("code",[this._v("HelloMacro")]),this._v(" trait 以及其关联函数：")])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[t("span",{staticClass:"filename"},[this._v("文件名: src/lib.rs")])])},function(){var e=this,t=e.$createElement,_=e._self._c||t;return _("div",{staticClass:"language-rust extra-class"},[_("pre",{pre:!0,attrs:{class:"language-rust"}},[_("code",[_("span",{attrs:{class:"token keyword"}},[e._v("pub")]),e._v(" "),_("span",{attrs:{class:"token keyword"}},[e._v("trait")]),e._v(" HelloMacro "),_("span",{attrs:{class:"token punctuation"}},[e._v("{")]),e._v("\n    "),_("span",{attrs:{class:"token keyword"}},[e._v("fn")]),e._v(" "),_("span",{attrs:{class:"token function"}},[e._v("hello_macro")]),_("span",{attrs:{class:"token punctuation"}},[e._v("(")]),_("span",{attrs:{class:"token punctuation"}},[e._v(")")]),_("span",{attrs:{class:"token punctuation"}},[e._v(";")]),e._v("\n"),_("span",{attrs:{class:"token punctuation"}},[e._v("}")]),e._v("\n")])])])},function(){var e=this.$createElement,t=this._self._c||e;return t("div",{staticClass:"language-rust,ignore extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[this._v('extern crate hello_macro;\n\nuse hello_macro::HelloMacro;\n\nstruct Pancakes;\n\nimpl HelloMacro for Pancakes {\n    fn hello_macro() {\n        println!("Hello, Macro! My name is Pancakes!");\n    }\n}\n\nfn main() {\n    Pancakes::hello_macro();\n}\n')])])])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[this._v("然而，他们需要为每一个他们想使用 "),t("code",[this._v("hello_macro")]),this._v(" 的类型编写实现的代码块。我们希望为其节约这些工作。")])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[this._v("另外，我们也无法为 "),t("code",[this._v("hello_macro")]),this._v(" 函数提供一个能够打印实现了该 trait 的类型的名字的默认实现：Rust 没有反射的能力，因此其无法在运行时获取类型名。我们需要一个在运行时生成代码的宏。")])},function(){var e=this,t=e.$createElement,_=e._self._c||t;return _("p",[e._v("下一步是定义过程式宏。在编写该附录时，过程式宏必须在包内。该限制后面可能被取消。构造包和包中宏的惯例如下：对于一个 "),_("code",[e._v("foo")]),e._v(" 的包来说，一个自定义的派生过程式宏的包被称为 "),_("code",[e._v("foo_derive")]),e._v(" 。在 "),_("code",[e._v("hello_macro")]),e._v(" 项目中新建名为 "),_("code",[e._v("hello_macro_derive")]),e._v(" 的包。")])},function(){var e=this.$createElement,t=this._self._c||e;return t("div",{staticClass:"language-text extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[this._v("$ cargo new hello_macro_derive --lib\n")])])])},function(){var e=this,t=e.$createElement,_=e._self._c||t;return _("p",[e._v("由于两个包紧密相关，因此在 "),_("code",[e._v("hello_macro")]),e._v(" 包的目录下创建过程式宏的包。如果改变在 "),_("code",[e._v("hello_macro")]),e._v(" 中定义的 trait ，同时也必须改变在 "),_("code",[e._v("hello_macro_derive")]),e._v(" 中实现的过程式宏。这两个包需要分别发布，编程人员如果使用这些包，则需要同时添加这两个依赖并导入到代码中。我们也可以只用 "),_("code",[e._v("hello_macro")]),e._v(" 包而将 "),_("code",[e._v("hello_macro_derive")]),e._v(" 作为一个依赖，并重新导出过程式宏的代码。但我们组织项目的方式使编程人员使用 "),_("code",[e._v("hello_macro")]),e._v(" 成为可能，即使他们无需 "),_("code",[e._v("derive")]),e._v(" 的功能。")])},function(){var e=this,t=e.$createElement,_=e._self._c||t;return _("p",[e._v("需要将 "),_("code",[e._v("hello_macro_derive")]),e._v(" 声明为一个过程式宏的包。同时也需要 "),_("code",[e._v("syn")]),e._v(" 和 "),_("code",[e._v("quote")]),e._v(" 包中的功能，正如注释中所说，需要将其加到依赖中。为 "),_("code",[e._v("hello_macro_derive")]),e._v(" 将下面的代码加入到 "),_("em",[e._v("Cargo.toml")]),e._v(" 文件中。")])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[t("span",{staticClass:"filename"},[this._v("文件名: hello_macro_derive/Cargo.toml")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("div",{staticClass:"language-toml extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[this._v('[lib]\nproc-macro = true\n\n[dependencies]\nsyn = "0.11.11"\nquote = "0.3.15"\n')])])])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[this._v("为定义一个过程式宏，请将示例 D-3 中的代码放在 "),t("code",[this._v("hello_macro_derive")]),this._v(" 包的 "),t("em",[this._v("src/lib.rs")]),this._v(" 文件里面。注意这段代码在我们添加 "),t("code",[this._v("impl_hello_macro")]),this._v(" 函数的定义之前是无法编译的。")])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[t("span",{staticClass:"filename"},[this._v("文件名: hello_macro_derive/src/lib.rs")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("div",{staticClass:"language-rust,ignore extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[this._v("extern crate proc_macro;\nextern crate syn;\n#[macro_use]\nextern crate quote;\n\nuse proc_macro::TokenStream;\n\n#[proc_macro_derive(HelloMacro)]\npub fn hello_macro_derive(input: TokenStream) -> TokenStream {\n    // Construct a string representation of the type definition\n    let s = input.to_string();\n\n    // Parse the string representation\n    let ast = syn::parse_derive_input(&s).unwrap();\n\n    // Build the impl\n    let gen = impl_hello_macro(&ast);\n\n    // Return the generated impl\n    gen.parse().unwrap()\n}\n")])])])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[t("span",{staticClass:"caption"},[this._v("示例 D-3: 大多数过程式宏处理 Rust 代码的代码")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[this._v("注意在 D-3 中分离函数的方式，这将和你几乎所见到或创建的每一个过程式宏都一样，因为这让编写一个过程式宏更加方便。在 "),t("code",[this._v("impl_hello_macro")]),this._v(" 被调用的地方所选择做的什么依赖于该过程式宏的目的而有所不同。")])},function(){var e=this,t=e.$createElement,_=e._self._c||t;return _("p",[e._v("当用户在一个类型上指定 "),_("code",[e._v("#[derive(HelloMacro)]")]),e._v(" 时，"),_("code",[e._v("hello_macro_derive")]),e._v("  函数将会被调用。\n原因在于我们已经使用 "),_("code",[e._v("proc_macro_derive")]),e._v(" 及其指定名称对 "),_("code",[e._v("hello_macro_derive")]),e._v(" 函数进行了注解："),_("code",[e._v("HelloMacro")]),e._v(" ，其匹配到 trait 名，这是大多数过程式宏的方便之处。")])},function(){var e=this,t=e.$createElement,_=e._self._c||t;return _("p",[e._v("该函数首先将来自 "),_("code",[e._v("TokenStream")]),e._v(" 的 "),_("code",[e._v("输入")]),e._v(" 转换为一个名为 "),_("code",[e._v("to_string")]),e._v(" 的 "),_("code",[e._v("String")]),e._v(" 类型。该 "),_("code",[e._v("String")]),e._v(" 代表 派生 "),_("code",[e._v("HelloMacro")]),e._v(" Rust 代码的字符串。在示例 D-2 的例子中，"),_("code",[e._v("s")]),e._v(" 是 "),_("code",[e._v("String")]),e._v(" 类型的 "),_("code",[e._v("struct Pancakes;")]),e._v(" 值，这是因为我们加上了 "),_("code",[e._v("#[derive(HelloMacro)]")]),e._v(" 注解。")])},function(){var e=this.$createElement,t=this._self._c||e;return t("blockquote",[t("p",[this._v("注意：编写本附录时，只可以将 "),t("code",[this._v("TokenStream")]),this._v(" 转换为字符串，将来会提供更丰富的API。")])])},function(){var e=this,t=e.$createElement,_=e._self._c||t;return _("p",[e._v("现在需要将 "),_("code",[e._v("String")]),e._v(" 类型的 Rust 代码 解析为一个数据结构中，随后便可以与之交互并操作该数据结构。这正是 "),_("code",[e._v("syn")]),e._v(" 所做的。"),_("code",[e._v("syn")]),e._v(" 中的 "),_("code",[e._v("parse_derive_input")]),e._v(" 函数以一个 "),_("code",[e._v("String")]),e._v(" 作为参数并返回一个 表示解析出 Rust 代码的 "),_("code",[e._v("DeriveInput")]),e._v(" 结构体。 下面的代码 展示了从字符串 "),_("code",[e._v("struct Pancakes;")]),e._v(" 中解析出来的 "),_("code",[e._v("DeriveInput")]),e._v(" 结构体的相关部分。")])},function(){var e=this.$createElement,t=this._self._c||e;return t("div",{staticClass:"language-rust,ignore extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[this._v('DeriveInput {\n    // --snip--\n\n    ident: Ident(\n        "Pancakes"\n    ),\n    body: Struct(\n        Unit\n    )\n}\n')])])])},function(){var e=this,t=e.$createElement,_=e._self._c||t;return _("p",[e._v("此时，尚未定义 "),_("code",[e._v("impl_hello_macro")]),e._v(" 函数，其用于构建所要包含在内的 Rust 新代码。但在定义之前，要注意 "),_("code",[e._v("hello_macro_derive")]),e._v(" 函数的最后一部分使用了 "),_("code",[e._v("quote")]),e._v(" 包中的 "),_("code",[e._v("parse")]),e._v(" 函数，该函数将 "),_("code",[e._v("impl_hello_macro")]),e._v(" 的输出返回给 "),_("code",[e._v("TokenStream")]),e._v(" 。所返回的 "),_("code",[e._v("TokenStream")]),e._v(" 会被加到我们的包用户所写的代码中，因此，当用户编译他们的包时，他们会获取到我们所提供的额外功能。")])},function(){var e=this,t=e.$createElement,_=e._self._c||t;return _("p",[e._v("你也注意到，当调用 "),_("code",[e._v("parse_derive_input")]),e._v(" 或 "),_("code",[e._v("parse")]),e._v(" 失败时，我们调用 "),_("code",[e._v("unwrap")]),e._v(" 来抛出异常。在过程式宏中，有必要错误上抛异常，因为 "),_("code",[e._v("proc_macro_derive")]),e._v(" 函数必须返回 "),_("code",[e._v("TokenStream")]),e._v(" 而不是 "),_("code",[e._v("Result")]),e._v(" ，以此来符合过程式宏的 API 。我们已经选择用 "),_("code",[e._v("unwrap")]),e._v(" 来简化了这个例子；在生产中的代码里，你应该通过 "),_("code",[e._v("panic!")]),e._v(" 或 "),_("code",[e._v("expect")]),e._v(" 来提供关于发生何种错误的更加明确的错误信息。")])},function(){var e=this,t=e.$createElement,_=e._self._c||t;return _("p",[e._v("现在我们有了将注解的 Rust 代码从 "),_("code",[e._v("TokenStream")]),e._v(" 转换为 "),_("code",[e._v("String")]),e._v(" 和 "),_("code",[e._v("DeriveInput")]),e._v(" 实例的代码，让我们来创建在注解类型上实现 "),_("code",[e._v("HelloMacro")]),e._v(" trait 的代码。")])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[t("span",{staticClass:"filename"},[this._v("文件名: hello_macro_derive/src/lib.rs")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("div",{staticClass:"language-rust,ignore extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[this._v('fn impl_hello_macro(ast: &syn::DeriveInput) -> quote::Tokens {\n    let name = &ast.ident;\n    quote! {\n        impl HelloMacro for #name {\n            fn hello_macro() {\n                println!("Hello, Macro! My name is {}", stringify!(#name));\n            }\n        }\n    }\n}\n')])])])},function(){var e=this,t=e.$createElement,_=e._self._c||t;return _("p",[e._v("我们得到一个包含以 "),_("code",[e._v("ast.ident")]),e._v(" 作为注解类型名字（标识符）的 "),_("code",[e._v("Ident")]),e._v(" 结构体实例。示例 D-2 中的代码说明 "),_("code",[e._v("name")]),e._v(" 会是 "),_("code",[e._v('Ident("Pancakes")')]),e._v(" 。")])},function(){var e=this,t=e.$createElement,_=e._self._c||t;return _("p",[e._v("我们期望我们的过程式宏能够为通过 "),_("code",[e._v("#name")]),e._v(" 获取到的用户注解类型生成 "),_("code",[e._v("HelloMacro")]),e._v(" trait 的实现。该 trait 的实现有一个函数 "),_("code",[e._v("hello_macro")]),e._v(" ，其函数体包括了我们期望提供的功能：打印 "),_("code",[e._v("Hello, Macro! My name is")]),e._v(" 和注解的类型名。")])},function(){var e=this,t=e.$createElement,_=e._self._c||t;return _("p",[e._v("此处所使用的 "),_("code",[e._v("stringify!")]),e._v(" 为 Rust 内置宏。其接收一个 Rust 表达式，如 "),_("code",[e._v("1 + 2")]),e._v(" ， 然后在编译时将表达式转换为一个字符串常量，如 "),_("code",[e._v('"1 + 2"')]),e._v(" 。这与 "),_("code",[e._v("format!")]),e._v(" 或 "),_("code",[e._v("println!")]),e._v(" 是不同的，它计算表达式并将结果转换为 "),_("code",[e._v("String")]),e._v(" 。有一种可能的情况是，所输入的 "),_("code",[e._v("#name")]),e._v(" 可能是一个需要打印的表达式，因此我们用 "),_("code",[e._v("stringify!")]),e._v(" 。 "),_("code",[e._v("stringify!")]),e._v(" 编译时也保留了一份将 "),_("code",[e._v("#name")]),e._v(" 转换为字符串之后的内存分配。")])},function(){var e=this.$createElement,t=this._self._c||e;return t("div",{staticClass:"language-toml extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[this._v('[dependencies]\nhello_macro = { path = "../hello_macro" }\nhello_macro_derive = { path = "../hello_macro/hello_macro_derive" }\n')])])])},function(){var e=this,t=e.$createElement,_=e._self._c||t;return _("p",[e._v("把示例 D-2 中的代码放在 "),_("em",[e._v("src/main.rs")]),e._v(" ，然后执行 "),_("code",[e._v("cargo run")]),e._v(" ： 其应该打印 "),_("code",[e._v("Hello, Macro! My name is Pancakes!")]),e._v(" 。从过程式宏中实现的 "),_("code",[e._v("HelloMacro")]),e._v(" trait 被包括在内，但并不包含 "),_("code",[e._v("pancakes")]),e._v(" 的包，需要实现它。"),_("code",[e._v("#[derive(HelloMacro)]")]),e._v(" 添加了该 trait 的实现。")])},function(){var e=this.$createElement,t=this._self._c||e;return t("h3",{attrs:{id:"宏的前景"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#宏的前景","aria-hidden":"true"}},[this._v("#")]),this._v(" 宏的前景")])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[this._v("在将来，Rust 仍会扩展声明式宏和过程式宏。Rust会通过 "),t("code",[this._v("macro")]),this._v(" 使用一个更好的声明式宏系统，以及为较之 "),t("code",[this._v("derive")]),this._v(" 的更强大的任务增加更多的过程式宏类型。在本书出版时，这些系统仍然在开发中，请查阅 Rust 在线文档以获取最新信息。")])}],!1,null,null,null);r.options.__file="appendix-04-macros.md";t.default=r.exports}}]);