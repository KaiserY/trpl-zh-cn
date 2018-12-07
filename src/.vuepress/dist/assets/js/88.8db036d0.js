(window.webpackJsonp=window.webpackJsonp||[]).push([[88],{182:function(e,t,_){"use strict";_.r(t);var c=_(0),n=Object(c.a)({},function(){var e=this,t=e.$createElement,_=e._self._c||t;return _("div",{staticClass:"content"},[e._m(0),e._v(" "),_("blockquote",[_("p",[_("a",{attrs:{href:"https://github.com/rust-lang/book/blob/master/second-edition/src/ch16-04-extensible-concurrency-sync-and-send.md",target:"_blank",rel:"noopener noreferrer"}},[e._v("ch16-04-extensible-concurrency-sync-and-send.md"),_("OutboundLink")],1),e._v(" "),_("br"),e._v("\ncommit 90406bd5a4cd4447b46cd7e03d33f34a651e9bb7")])]),e._v(" "),e._m(1),e._v(" "),e._m(2),e._v(" "),e._m(3),e._v(" "),e._m(4),e._v(" "),e._m(5),e._v(" "),e._m(6),e._v(" "),e._m(7),e._v(" "),e._m(8),e._v(" "),e._m(9),e._v(" "),e._m(10),e._v(" "),e._m(11),e._v(" "),_("p",[e._v("手动实现这些标记 trait 涉及到编写不安全的 Rust 代码，第十九章将会讲述具体的方法；当前重要的是，在创建新的由不是 "),_("code",[e._v("Send")]),e._v(" 和 "),_("code",[e._v("Sync")]),e._v(" 的部分构成的并发类型时需要多加小心，以确保维持其安全保证。"),_("a",{attrs:{href:"https://doc.rust-lang.org/stable/nomicon/",target:"_blank",rel:"noopener noreferrer"}},[e._v("The Nomicon"),_("OutboundLink")],1),e._v(" 中有更多关于这些保证以及如何维持他们的信息。")]),e._v(" "),e._m(12),e._v(" "),_("p",[e._v("这不会是本书最后一个出现并发的章节：第二十章的项目会在更现实的场景中使用这些概念，而不像本章中讨论的这些小例子。")]),e._v(" "),_("p",[e._v("正如之前提到的，因为 Rust 本身很少有处理并发的部分内容，有很多的并发方案都由 crate 实现。他们比标准库要发展的更快；请在网上搜索当前最新的用于多线程场景的 crate。")]),e._v(" "),e._m(13),e._v(" "),_("p",[e._v("接下来，让我们讨论一下当 Rust 程序变得更大时，有哪些符合语言习惯的问题建模方法和结构化解决方案，以及 Rust 的风格是如何与面向对象编程（Object Oriented Programming）中那些你所熟悉的概念相联系的。")])])},[function(){var e=this.$createElement,t=this._self._c||e;return t("h2",{attrs:{id:"使用-sync-和-send-trait-的可扩展并发"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#使用-sync-和-send-trait-的可扩展并发","aria-hidden":"true"}},[this._v("#")]),this._v(" 使用 "),t("code",[this._v("Sync")]),this._v(" 和 "),t("code",[this._v("Send")]),this._v(" trait 的可扩展并发")])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[this._v("Rust 的并发模型中一个有趣的方面是：语言本身对并发知之 "),t("strong",[this._v("甚少")]),this._v("。我们之前讨论的几乎所有内容，都属于标准库，而不是语言本身的内容。由于不需要语言提供并发相关的基础设施，并发方案不受标准库或语言所限：我们可以编写自己的或使用别人编写的并发功能。")])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[this._v("然而有两个并发概念是内嵌于语言中的："),t("code",[this._v("std::marker")]),this._v(" 中的 "),t("code",[this._v("Sync")]),this._v(" 和 "),t("code",[this._v("Send")]),this._v(" trait。")])},function(){var e=this.$createElement,t=this._self._c||e;return t("h3",{attrs:{id:"通过-send-允许在线程间转移所有权"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#通过-send-允许在线程间转移所有权","aria-hidden":"true"}},[this._v("#")]),this._v(" 通过 "),t("code",[this._v("Send")]),this._v(" 允许在线程间转移所有权")])},function(){var e=this,t=e.$createElement,_=e._self._c||t;return _("p",[_("code",[e._v("Send")]),e._v(" 标记 trait 表明类型的所有权可以在线程间传递。几乎所有的 Rust 类型都是"),_("code",[e._v("Send")]),e._v(" 的，不过有一些例外，包括 "),_("code",[e._v("Rc<T>")]),e._v("：这是不能 "),_("code",[e._v("Send")]),e._v(" 的，因为如果克隆了 "),_("code",[e._v("Rc<T>")]),e._v(" 的值并尝试将克隆的所有权转移到另一个线程，这两个线程都可能同时更新引用计数。为此，"),_("code",[e._v("Rc<T>")]),e._v(" 被实现为用于单线程场景，这时不需要为拥有线程安全的引用计数而付出性能代价。")])},function(){var e=this,t=e.$createElement,_=e._self._c||t;return _("p",[e._v("因此，Rust 类型系统和 trait bound 确保永远也不会意外的将不安全的 "),_("code",[e._v("Rc<T>")]),e._v(" 在线程间发送。当尝试在示例 16-14 中这么做的时候，会得到错误 "),_("code",[e._v("the trait Send is not implemented for Rc<Mutex<i32>>")]),e._v("。而使用标记为 "),_("code",[e._v("Send")]),e._v(" 的 "),_("code",[e._v("Arc<T>")]),e._v(" 时，就没有问题了。")])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[this._v("任何完全由 "),t("code",[this._v("Send")]),this._v(" 的类型组成的类型也会自动被标记为 "),t("code",[this._v("Send")]),this._v("。几乎所有基本类型都是 "),t("code",[this._v("Send")]),this._v(" 的，除了第十九章将会讨论的裸指针（raw pointer）。")])},function(){var e=this.$createElement,t=this._self._c||e;return t("h3",{attrs:{id:"sync-允许多线程访问"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#sync-允许多线程访问","aria-hidden":"true"}},[this._v("#")]),this._v(" "),t("code",[this._v("Sync")]),this._v(" 允许多线程访问")])},function(){var e=this,t=e.$createElement,_=e._self._c||t;return _("p",[_("code",[e._v("Sync")]),e._v(" 标记 trait 表明一个实现了 "),_("code",[e._v("Sync")]),e._v(" 的类型可以安全的在多个线程中拥有其值的引用。换一种方式来说，对于任意类型 "),_("code",[e._v("T")]),e._v("，如果 "),_("code",[e._v("&T")]),e._v("（"),_("code",[e._v("T")]),e._v(" 的引用）是 "),_("code",[e._v("Send")]),e._v(" 的话 "),_("code",[e._v("T")]),e._v(" 就是 "),_("code",[e._v("Sync")]),e._v(" 的，这意味着其引用就可以安全的发送到另一个线程。类似于 "),_("code",[e._v("Send")]),e._v(" 的情况，基本类型是 "),_("code",[e._v("Sync")]),e._v(" 的，完全由 "),_("code",[e._v("Sync")]),e._v(" 的类型组成的类型也是 "),_("code",[e._v("Sync")]),e._v(" 的。")])},function(){var e=this,t=e.$createElement,_=e._self._c||t;return _("p",[e._v("智能指针 "),_("code",[e._v("Rc<T>")]),e._v(" 也不是 "),_("code",[e._v("Sync")]),e._v(" 的，出于其不是 "),_("code",[e._v("Send")]),e._v(" 相同的原因。"),_("code",[e._v("RefCell<T>")]),e._v("（第十五章讨论过）和 "),_("code",[e._v("Cell<T>")]),e._v(" 系列类型不是 "),_("code",[e._v("Sync")]),e._v(" 的。"),_("code",[e._v("RefCell<T>")]),e._v(" 在运行时所进行的借用检查也不是线程安全的。"),_("code",[e._v("Mutex<T>")]),e._v(" 是 "),_("code",[e._v("Sync")]),e._v(" 的，正如 “在线程间共享 "),_("code",[e._v("Mutex<T>")]),e._v("” 部分所讲的它可以被用来在多线程中共享访问。")])},function(){var e=this.$createElement,t=this._self._c||e;return t("h3",{attrs:{id:"手动实现-send-和-sync-是不安全的"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#手动实现-send-和-sync-是不安全的","aria-hidden":"true"}},[this._v("#")]),this._v(" 手动实现 "),t("code",[this._v("Send")]),this._v(" 和 "),t("code",[this._v("Sync")]),this._v(" 是不安全的")])},function(){var e=this,t=e.$createElement,_=e._self._c||t;return _("p",[e._v("通常并不需要手动实现 "),_("code",[e._v("Send")]),e._v(" 和 "),_("code",[e._v("Sync")]),e._v(" trait，因为由 "),_("code",[e._v("Send")]),e._v(" 和 "),_("code",[e._v("Sync")]),e._v(" 的类型组成的类型，自动就是 "),_("code",[e._v("Send")]),e._v(" 和 "),_("code",[e._v("Sync")]),e._v(" 的。因为他们是标记 trait，甚至都不需要实现任何方法。他们只是用来加强并发相关的不可变性的。")])},function(){var e=this.$createElement,t=this._self._c||e;return t("h2",{attrs:{id:"总结"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#总结","aria-hidden":"true"}},[this._v("#")]),this._v(" 总结")])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[this._v("Rust 提供了用于消息传递的通道，和像 "),t("code",[this._v("Mutex<T>")]),this._v(" 和 "),t("code",[this._v("Arc<T>")]),this._v(" 这样可以安全的用于并发上下文的智能指针。类型系统和借用检查器会确保这些场景中的代码，不会出现数据竞争和无效的引用。一旦代码可以编译了，我们就可以坚信这些代码可以正确的运行于多线程环境，而不会出现其他语言中经常出现的那些难以追踪的 bug。并发编程不再是什么可怕的概念：无所畏惧地并发吧！")])}],!1,null,null,null);n.options.__file="ch16-04-extensible-concurrency-sync-and-send.md";t.default=n.exports}}]);