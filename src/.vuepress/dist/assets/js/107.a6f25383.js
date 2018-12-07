(window.webpackJsonp=window.webpackJsonp||[]).push([[107],{242:function(t,e,s){"use strict";s.r(e);var n=s(0),a=Object(n.a)({},function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"content"},[t._m(0),t._v(" "),s("blockquote",[s("p",[s("a",{attrs:{href:"https://github.com/rust-lang/book/blob/master/second-edition/src/ch20-03-designing-the-interface.md",target:"_blank",rel:"noopener noreferrer"}},[t._v("ch20-03-designing-the-interface.md"),s("OutboundLink")],1),t._v(" "),s("br"),t._v("\ncommit d06a6a181fd61704cbf7feb55bc61d518c6469f9")])]),t._v(" "),s("p",[t._v("让我们讨论一下线程池看起来怎样。库作者们经常会发现，当尝试设计一些代码时，首先编写客户端接口确实有助于指导代码设计。以期望的调用方式来构建 API 代码的结构，接着在这个结构之内实现功能，而不是先实现功能再设计公有 API。")]),t._v(" "),s("p",[t._v("类似于第十二章项目中使用的测试驱动开发。这里将要使用编译器驱动开发（Compiler Driven Development）。我们将编写调用所期望的函数的代码，接着依靠编译器告诉我们接下来需要修改什么。编译器错误信息会指导我们的实现。")]),t._v(" "),t._m(1),t._v(" "),t._m(2),t._v(" "),t._m(3),t._v(" "),t._m(4),t._m(5),t._v(" "),t._m(6),t._v(" "),t._m(7),t._v(" "),t._m(8),t._v(" "),t._m(9),t._v(" "),t._m(10),t._m(11),t._v(" "),t._m(12),t._v(" "),t._m(13),t._v(" "),t._m(14),t._v(" "),t._m(15),t._m(16),t._v(" "),t._m(17),t._v(" "),t._m(18),t._v(" "),t._m(19),t._m(20),t._v(" "),t._m(21),t._v(" "),t._m(22),s("p",[t._v("再次尝试运行来得到下一个需要解决的错误：")]),t._v(" "),t._m(23),t._m(24),t._v(" "),t._m(25),t._v(" "),t._m(26),t._m(27),t._v(" "),s("p",[t._v("再次编译检查这段代码：")]),t._v(" "),t._m(28),t._m(29),t._v(" "),t._m(30),t._m(31),t._v(" "),t._m(32),t._v(" "),t._m(33),t._v(" "),t._m(34),t._m(35),t._v(" "),t._m(36),t._v(" "),t._m(37),t._m(38),t._v(" "),t._m(39)])},[function(){var t=this.$createElement,e=this._self._c||t;return e("h2",{attrs:{id:"设计线程池接口"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#设计线程池接口","aria-hidden":"true"}},[this._v("#")]),this._v(" 设计线程池接口")])},function(){var t=this.$createElement,e=this._self._c||t;return e("h3",{attrs:{id:"如果使用-thread-spawn-的代码结构"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#如果使用-thread-spawn-的代码结构","aria-hidden":"true"}},[this._v("#")]),this._v(" 如果使用 "),e("code",[this._v("thread::spawn")]),this._v(" 的代码结构")])},function(){var t=this.$createElement,e=this._self._c||t;return e("p",[this._v("首先，让我们探索一下为每一个连接都创建一个线程看起来如何。这并不是最终方案，因为正如之前讲到的它会潜在的分配无限的线程，不过这是一个开始。列表 20-11 展示了 "),e("code",[this._v("main")]),this._v(" 的改变，它在 "),e("code",[this._v("for")]),this._v(" 循环中为每一个流分配了一个新线程进行处理：")])},function(){var t=this.$createElement,e=this._self._c||t;return e("p",[e("span",{staticClass:"filename"},[this._v("Filename: src/main.rs")])])},function(){var t=this.$createElement,e=this._self._c||t;return e("div",{staticClass:"language-rust,no_run extra-class"},[e("pre",{pre:!0,attrs:{class:"language-text"}},[e("code",[this._v('# use std::thread;\n# use std::io::prelude::*;\n# use std::net::TcpListener;\n# use std::net::TcpStream;\n#\nfn main() {\n    let listener = TcpListener::bind("127.0.0.1:8080").unwrap();\n\n    for stream in listener.incoming() {\n        let stream = stream.unwrap();\n\n        thread::spawn(|| {\n            handle_connection(stream);\n        });\n    }\n}\n# fn handle_connection(mut stream: TcpStream) {}\n')])])])},function(){var t=this.$createElement,e=this._self._c||t;return e("p",[e("span",{staticClass:"caption"},[this._v("列表 20-11：为每一个流新建一个线程")])])},function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("p",[t._v("正如第十六章讲到的，"),s("code",[t._v("thread::spawn")]),t._v(" 会创建一个新线程并运行闭包中的代码。如果运行这段代码并在两个浏览器标签页中加载 "),s("code",[t._v("/sleep")]),t._v(" 和 "),s("code",[t._v("/")]),t._v("，确实会发现 "),s("code",[t._v("/")]),t._v(" 请求并没有等待 "),s("code",[t._v("/sleep")]),t._v(" 结束。不过正如之前提到的，这最终会使系统崩溃因为我们无限制的创建新线程。")])},function(){var t=this.$createElement,e=this._self._c||t;return e("h3",{attrs:{id:"为-threadpool-创建一个类似的接口"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#为-threadpool-创建一个类似的接口","aria-hidden":"true"}},[this._v("#")]),this._v(" 为 "),e("code",[this._v("ThreadPool")]),this._v(" 创建一个类似的接口")])},function(){var t=this.$createElement,e=this._self._c||t;return e("p",[this._v("我们期望线程池以类似且熟悉的方式工作，以便从线程切换到线程池并不会对运行于线程池中的代码做出较大的修改。列表 20-12 展示我们希望用来替换 "),e("code",[this._v("thread::spawn")]),this._v(" 的 "),e("code",[this._v("ThreadPool")]),this._v(" 结构体的假想接口：")])},function(){var t=this.$createElement,e=this._self._c||t;return e("p",[e("span",{staticClass:"filename"},[this._v("文件名: src/main.rs")])])},function(){var t=this.$createElement,e=this._self._c||t;return e("div",{staticClass:"language-rust,no_run extra-class"},[e("pre",{pre:!0,attrs:{class:"language-text"}},[e("code",[this._v('# use std::thread;\n# use std::io::prelude::*;\n# use std::net::TcpListener;\n# use std::net::TcpStream;\n# struct ThreadPool;\n# impl ThreadPool {\n#    fn new(size: u32) -> ThreadPool { ThreadPool }\n#    fn execute<F>(&self, f: F)\n#        where F: FnOnce() + Send + \'static {}\n# }\n#\nfn main() {\n    let listener = TcpListener::bind("127.0.0.1:8080").unwrap();\n    let pool = ThreadPool::new(4);\n\n    for stream in listener.incoming() {\n        let stream = stream.unwrap();\n\n        pool.execute(|| {\n            handle_connection(stream);\n        });\n    }\n}\n# fn handle_connection(mut stream: TcpStream) {}\n')])])])},function(){var t=this.$createElement,e=this._self._c||t;return e("p",[e("span",{staticClass:"caption"},[this._v("列表 20-12：如何使用我们将要实现的 "),e("code",[this._v("ThreadPool")])])])},function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("p",[t._v("这里使用 "),s("code",[t._v("ThreadPool::new")]),t._v(" 来创建一个新的线程池，它有一个可配置的线程数的参数，在这里是四。这样在 "),s("code",[t._v("for")]),t._v(" 循环中，"),s("code",[t._v("pool.execute")]),t._v(" 将会以类似 "),s("code",[t._v("thread::spawn")]),t._v(" 的方式工作。")])},function(){var t=this.$createElement,e=this._self._c||t;return e("h3",{attrs:{id:"采用编译器驱动开发来驱动-api-的编译"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#采用编译器驱动开发来驱动-api-的编译","aria-hidden":"true"}},[this._v("#")]),this._v(" 采用编译器驱动开发来驱动 API 的编译")])},function(){var t=this.$createElement,e=this._self._c||t;return e("p",[this._v("继续并对列表 20-12 中的 "),e("em",[this._v("src/main.rs")]),this._v(" 做出修改，并利用编译器错误来驱动开发。下面是我们得到的第一个错误：")])},function(){var t=this.$createElement,e=this._self._c||t;return e("div",{staticClass:"language- extra-class"},[e("pre",{pre:!0,attrs:{class:"language-text"}},[e("code",[this._v("$ cargo check\n   Compiling hello v0.1.0 (file:///projects/hello)\nerror[E0433]: failed to resolve. Use of undeclared type or module `ThreadPool`\n  --\x3e src\\main.rs:10:16\n   |\n10 |     let pool = ThreadPool::new(4);\n   |                ^^^^^^^^^^^^^^^ Use of undeclared type or module\n   `ThreadPool`\n\nerror: aborting due to previous error\n")])])])},function(){var t=this.$createElement,e=this._self._c||t;return e("p",[this._v("好的，我们需要一个 "),e("code",[this._v("ThreadPool")]),this._v("。将 "),e("code",[this._v("hello")]),this._v(" crate 从二进制 crate 转换为库 crate 来存放 "),e("code",[this._v("ThreadPool")]),this._v(" 实现，因为线程池实现与我们的 web server 的特定工作相独立。一旦写完了线程池库，就可以在任何工作中使用这个功能，而不仅仅是处理网络请求。")])},function(){var t=this.$createElement,e=this._self._c||t;return e("p",[this._v("创建 "),e("em",[this._v("src/lib.rs")]),this._v(" 文件，它包含了目前可用的最简单的 "),e("code",[this._v("ThreadPool")]),this._v(" 定义：")])},function(){var t=this.$createElement,e=this._self._c||t;return e("p",[e("span",{staticClass:"filename"},[this._v("文件名: src/lib.rs")])])},function(){var t=this.$createElement,e=this._self._c||t;return e("div",{staticClass:"language-rust extra-class"},[e("pre",{pre:!0,attrs:{class:"language-rust"}},[e("code",[e("span",{attrs:{class:"token keyword"}},[this._v("pub")]),this._v(" "),e("span",{attrs:{class:"token keyword"}},[this._v("struct")]),this._v(" ThreadPool"),e("span",{attrs:{class:"token punctuation"}},[this._v(";")]),this._v("\n")])])])},function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("p",[t._v("接着创建一个新目录，"),s("em",[t._v("src/bin")]),t._v("，并将二进制 crate 根文件从 "),s("em",[t._v("src/main.rs")]),t._v(" 移动到 "),s("em",[t._v("src/bin/main.rs")]),t._v("。这使得库 crate 成为 "),s("em",[t._v("hello")]),t._v(" 目录的主要 crate；不过仍然可以使用 "),s("code",[t._v("cargo run")]),t._v(" 运行 "),s("em",[t._v("src/bin/main.rs")]),t._v(" 二进制文件。移动了 "),s("em",[t._v("main.rs")]),t._v(" 文件之后，修改文件开头加入如下代码来引入库 crate 并将 "),s("code",[t._v("ThreadPool")]),t._v(" 引入作用域：")])},function(){var t=this.$createElement,e=this._self._c||t;return e("p",[e("span",{staticClass:"filename"},[this._v("文件名: src/bin/main.rs")])])},function(){var t=this.$createElement,e=this._self._c||t;return e("div",{staticClass:"language-rust,ignore extra-class"},[e("pre",{pre:!0,attrs:{class:"language-text"}},[e("code",[this._v("extern crate hello;\nuse hello::ThreadPool;\n")])])])},function(){var t=this.$createElement,e=this._self._c||t;return e("div",{staticClass:"language- extra-class"},[e("pre",{pre:!0,attrs:{class:"language-text"}},[e("code",[this._v("$ cargo check\n   Compiling hello v0.1.0 (file:///projects/hello)\nerror: no associated item named `new` found for type `hello::ThreadPool` in the\ncurrent scope\n  --\x3e src\\main.rs:13:16\n   |\n13 |     let pool = ThreadPool::new(4);\n   |                ^^^^^^^^^^^^^^^\n   |\n")])])])},function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("p",[t._v("好的，下一步是为 "),s("code",[t._v("ThreadPool")]),t._v(" 创建一个叫做 "),s("code",[t._v("new")]),t._v(" 的关联函数。我们还知道 "),s("code",[t._v("new")]),t._v(" 需要有一个参数可以接受 "),s("code",[t._v("4")]),t._v("，而且 "),s("code",[t._v("new")]),t._v(" 应该返回 "),s("code",[t._v("ThreadPool")]),t._v(" 实例。让我们实现拥有此特征的最小化 "),s("code",[t._v("new")]),t._v(" 函数：")])},function(){var t=this.$createElement,e=this._self._c||t;return e("p",[e("span",{staticClass:"filename"},[this._v("文件夹: src/lib.rs")])])},function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"language-rust extra-class"},[s("pre",{pre:!0,attrs:{class:"language-rust"}},[s("code",[s("span",{attrs:{class:"token keyword"}},[t._v("pub")]),t._v(" "),s("span",{attrs:{class:"token keyword"}},[t._v("struct")]),t._v(" ThreadPool"),s("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n"),s("span",{attrs:{class:"token keyword"}},[t._v("impl")]),t._v(" ThreadPool "),s("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),s("span",{attrs:{class:"token keyword"}},[t._v("pub")]),t._v(" "),s("span",{attrs:{class:"token keyword"}},[t._v("fn")]),t._v(" "),s("span",{attrs:{class:"token function"}},[t._v("new")]),s("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("size"),s("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" u32"),s("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{attrs:{class:"token punctuation"}},[t._v("->")]),t._v(" ThreadPool "),s("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        ThreadPool\n    "),s("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),s("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])])},function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("p",[t._v("这里的 "),s("code",[t._v("size")]),t._v(" 参数是 "),s("code",[t._v("u32")]),t._v(" 类型，因为我们知道为负的线程数没有意义。"),s("code",[t._v("u32")]),t._v(" 是一个很好的默认值。一旦真正实现了 "),s("code",[t._v("new")]),t._v("，我们将考虑实现需要选择什么类型，目前我们仅仅处理编译器错误。")])},function(){var t=this.$createElement,e=this._self._c||t;return e("div",{staticClass:"language- extra-class"},[e("pre",{pre:!0,attrs:{class:"language-text"}},[e("code",[this._v("$ cargo check\n   Compiling hello v0.1.0 (file:///projects/hello)\nwarning: unused variable: `size`, #[warn(unused_variables)] on by default\n --\x3e src/lib.rs:4:16\n  |\n4 |     pub fn new(size: u32) -> ThreadPool {\n  |                ^^^^\n\nerror: no method named `execute` found for type `hello::ThreadPool` in the\ncurrent scope\n  --\x3e src/main.rs:18:14\n   |\n18 |         pool.execute(|| {\n   |              ^^^^^^^\n")])])])},function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("p",[t._v("好的，一个警告和一个错误。暂时先忽略警告，错误是因为并没有 "),s("code",[t._v("ThreadPool")]),t._v(" 上的 "),s("code",[t._v("execute")]),t._v(" 方法。让我们来定义一个，它应该能接受一个闭包。如果你还记得第十三章，闭包作为参数时可以使用三个不同的 trait："),s("code",[t._v("Fn")]),t._v("、"),s("code",[t._v("FnMut")]),t._v(" 和 "),s("code",[t._v("FnOnce")]),t._v("。那么应该用哪一种闭包呢？好吧，最终需要实现的类似于 "),s("code",[t._v("thread::spawn")]),t._v("；"),s("code",[t._v("thread::spawn")]),t._v(" 的签名在其参数中使用了何种 bound 呢？查看文档会发现：")])},function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"language-rust extra-class"},[s("pre",{pre:!0,attrs:{class:"language-rust"}},[s("code",[s("span",{attrs:{class:"token keyword"}},[t._v("pub")]),t._v(" "),s("span",{attrs:{class:"token keyword"}},[t._v("fn")]),t._v(" spawn"),s("span",{attrs:{class:"token operator"}},[t._v("<")]),t._v("F"),s("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" T"),s("span",{attrs:{class:"token operator"}},[t._v(">")]),s("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("f"),s("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" F"),s("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{attrs:{class:"token punctuation"}},[t._v("->")]),t._v(" JoinHandle"),s("span",{attrs:{class:"token operator"}},[t._v("<")]),t._v("T"),s("span",{attrs:{class:"token operator"}},[t._v(">")]),t._v("\n    "),s("span",{attrs:{class:"token keyword"}},[t._v("where")]),t._v("\n        F"),s("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),s("span",{attrs:{class:"token function"}},[t._v("FnOnce")]),s("span",{attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{attrs:{class:"token punctuation"}},[t._v("->")]),t._v(" T "),s("span",{attrs:{class:"token operator"}},[t._v("+")]),t._v(" Send "),s("span",{attrs:{class:"token operator"}},[t._v("+")]),t._v(" "),s("span",{attrs:{class:"token lifetime-annotation symbol"}},[t._v("'static,")]),t._v("\n        T"),s("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" Send "),s("span",{attrs:{class:"token operator"}},[t._v("+")]),t._v(" "),s("span",{attrs:{class:"token lifetime-annotation symbol"}},[t._v("'static")]),t._v("\n")])])])},function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("p",[s("code",[t._v("F")]),t._v(" 是这里我们关心的参数；"),s("code",[t._v("T")]),t._v(" 与返回值有关所以我们并不关心。考虑到 "),s("code",[t._v("spawn")]),t._v(" 使用 "),s("code",[t._v("FnOnce")]),t._v(" 作为 "),s("code",[t._v("F")]),t._v(" 的 trait bound，这可能也是我们需要的，因为最终会将传递给 "),s("code",[t._v("execute")]),t._v(" 的参数传给 "),s("code",[t._v("spawn")]),t._v("。因为处理请求的线程只会执行闭包一次，这也进一步确认了 "),s("code",[t._v("FnOnce")]),t._v(" 是我们需要的 trait。")])},function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("p",[s("code",[t._v("F")]),t._v(" 还有 trait bound "),s("code",[t._v("Send")]),t._v(" 和生命周期绑定 "),s("code",[t._v("'static")]),t._v("，这对我们的情况也是有意义的：需要 "),s("code",[t._v("Send")]),t._v(" 来将闭包从一个线程转移到另一个线程，而 "),s("code",[t._v("'static")]),t._v(" 是因为并不知道线程会执行多久。让我们编写一个使用这些 bound 的泛型参数 "),s("code",[t._v("F")]),t._v(" 的 "),s("code",[t._v("ThreadPool")]),t._v(" 的 "),s("code",[t._v("execute")]),t._v(" 方法：")])},function(){var t=this.$createElement,e=this._self._c||t;return e("p",[e("span",{staticClass:"filename"},[this._v("文件名: src/lib.rs")])])},function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"language-rust extra-class"},[s("pre",{pre:!0,attrs:{class:"language-rust"}},[s("code",[t._v("# "),s("span",{attrs:{class:"token keyword"}},[t._v("pub")]),t._v(" "),s("span",{attrs:{class:"token keyword"}},[t._v("struct")]),t._v(" ThreadPool"),s("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),s("span",{attrs:{class:"token keyword"}},[t._v("impl")]),t._v(" ThreadPool "),s("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),s("span",{attrs:{class:"token comment"}},[t._v("// ...snip...")]),t._v("\n\n    "),s("span",{attrs:{class:"token keyword"}},[t._v("pub")]),t._v(" "),s("span",{attrs:{class:"token keyword"}},[t._v("fn")]),t._v(" execute"),s("span",{attrs:{class:"token operator"}},[t._v("<")]),t._v("F"),s("span",{attrs:{class:"token operator"}},[t._v(">")]),s("span",{attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{attrs:{class:"token operator"}},[t._v("&")]),s("span",{attrs:{class:"token keyword"}},[t._v("self")]),s("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" f"),s("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" F"),s("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n        "),s("span",{attrs:{class:"token keyword"}},[t._v("where")]),t._v("\n            F"),s("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),s("span",{attrs:{class:"token function"}},[t._v("FnOnce")]),s("span",{attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{attrs:{class:"token operator"}},[t._v("+")]),t._v(" Send "),s("span",{attrs:{class:"token operator"}},[t._v("+")]),t._v(" "),s("span",{attrs:{class:"token lifetime-annotation symbol"}},[t._v("'static")]),t._v("\n    "),s("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n\n    "),s("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),s("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])])},function(){var t=this.$createElement,e=this._self._c||t;return e("p",[e("code",[this._v("FnOnce")]),this._v(" trait 仍然需要之后的 "),e("code",[this._v("()")]),this._v("，因为这里的 "),e("code",[this._v("FnOnce")]),this._v(" 代表一个没有参数也没有返回值的闭包。正如函数的定义，返回值类型可以从签名中省略，不过即便没有参数也需要括号。")])},function(){var t=this.$createElement,e=this._self._c||t;return e("p",[this._v("因为我们仍在努力使接口能够编译，这里增加了 "),e("code",[this._v("execute")]),this._v(" 方法的最小化实现，它没有做任何工作。再次进行检查：")])},function(){var t=this.$createElement,e=this._self._c||t;return e("div",{staticClass:"language- extra-class"},[e("pre",{pre:!0,attrs:{class:"language-text"}},[e("code",[this._v("$ cargo check\n   Compiling hello v0.1.0 (file:///projects/hello)\nwarning: unused variable: `size`, #[warn(unused_variables)] on by default\n --\x3e src/lib.rs:4:16\n  |\n4 |     pub fn new(size: u32) -> ThreadPool {\n  |                ^^^^\n\nwarning: unused variable: `f`, #[warn(unused_variables)] on by default\n --\x3e src/lib.rs:8:30\n  |\n8 |     pub fn execute<F>(&self, f: F)\n  |                              ^\n")])])])},function(){var t=this.$createElement,e=this._self._c||t;return e("p",[this._v("现在就只有警告了！能够编译了！注意如果尝试 "),e("code",[this._v("cargo run")]),this._v(" 运行程序并在浏览器中发起请求，仍会在浏览器中出现在本章开始时那样的错误。这个库实际上还没有调用传递给 "),e("code",[this._v("execute")]),this._v(" 的闭包！")])},function(){var t=this.$createElement,e=this._self._c||t;return e("blockquote",[e("p",[this._v("一个你可能听说过的关于像 Haskell 和 Rust 这样有严格编译器的语言的说法是“如果代码能够编译，它就能工作”。这是一个提醒大家的好时机，这只是一个说法和一种有时存在的感觉，实际上并不是完全正确的。我们的项目可以编译，不过它绝对没有做任何工作！如果构建一个真实且功能完整的项目，则需花费大量的时间来开始编写单元测试来检查代码能否编译"),e("strong",[this._v("并且")]),this._v("拥有期望的行为。")])])}],!1,null,null,null);a.options.__file="ch20-03-designing-the-interface.md";e.default=a.exports}}]);