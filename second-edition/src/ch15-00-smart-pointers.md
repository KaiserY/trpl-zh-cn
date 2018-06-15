# 智能指针

> [ch15-00-smart-pointers.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch15-00-smart-pointers.md)
> <br>
> commit 68267b982a226fa252e9afa1a5029396ccf5fa03

**指针** （*pointer*）是一个包含内存地址的变量的通用概念。这个地址引用，或 “指向”（points at）一些其他数据。Rust 中最常见的指针是第四章介绍的 **引用**（*reference*）。引用以 `&` 符号为标志并借用了他们所指向的值。除了引用数据它们没有任何其他特殊功能。它们也没有任何额外开销，所以应用的最多。

另一方面，**智能指针**（*smart pointers*）是一类数据结构，他们的表现类似指针，但是也拥有额外的元数据和功能。智能指针的概念并不为 Rust 所独有；其起源于 C++ 并存在于其他语言中。Rust 标准库中不同的智能指针提供了多于引用的额外功能。本章将会探索的一个例子便是 **引用计数** （*reference counting*）智能指针类型，其允许数据有多个所有者。引用计数智能指针记录总共有多少个所有者，并当没有任何所有者时负责清理数据。

<!-- maybe a brief explanation what deref and drop? I'm not really sure what
reference counting is here too, can you outline that in brief?-->
<!-- We've added a quick explanation of reference counting here and a brief
explanation of deref and drop below. /Carol -->

<!--(regarding C++) if this is relevant here, can you expand? Are we saying
they will be familiar to C++ people? -->
<!-- We were trying to say that "smart pointer" isn't something particular to
Rust; we've tried to clarify. /Carol -->

在 Rust 中，普通引用和智能指针的一个额外的区别是引用是一类只借用数据的指针；相反大部分情况，智能指针 **拥有** 他们指向的数据。

实际上本书中已经出现过一些智能指针，比如第八章的 `String` 和 `Vec<T>`，虽然当时我们并不这么称呼它们。这些类型都属于智能指针因为它们拥有一些数据并允许你修改它们。它们也带有元数据（比如他们的容量）和额外的功能或保证（`String` 的数据总是有效的 UTF-8 编码）。

<!-- Above: we said smart pointers don't own values earlier but in the
paragraph above we're saying String and Vec own memory, is that a
contradiction? -->
<!-- Our original text read: "In Rust, an additional difference between plain
references and smart pointers is that references are a kind of pointer that
only borrow data; by contrast, in many cases, smart pointers *own* the data
that they point to." You had edited this to say the opposite: "In Rust, smart
pointers can only borrow data, whereas in many other languages, smart pointers
*own* the data they point to." We had the "in rust" phrase not to distinguish
Rust's smart pointer implementation from other languages' smart pointer
implementations, but to acknowledge that the concept of borrowing and ownership
doesn't apply in many languages. The distinction between references borrowing
and smart pointers owning is important in the context of Rust. We've tried to
clarify the sentence talking about C++ and separate it from the discussion of
borrowing vs owning. So there shouldn't be a contradiction, and it should be
clearer that smart pointers usually own the data they point to. /Carol -->

智能指针通常使用结构体实现。智能指针区别于常规结构体的显著特性在于其实现了 `Deref` 和 `Drop` trait。`Deref` trait 允许智能指针结构体实例表现的像引用一样，这样就可以编写既用于引用又用于智能指针的代码。`Drop` trait 允许我们自定义当智能指针离开作用域时运行的代码。本章会讨论这些 trait 以及为什么对于智能指针来说他们很重要。

考虑到智能指针是一个在 Rust 经常被使用的通用设计模式，本章并不会覆盖所有现存的智能指针。很多库都有自己的智能指针而你也可以编写属于你自己的智能指针。这里将会讲到的是来自标准库中最常用的一些：

<!-- Would it make sense to hyphenate reference-counted (and its derivations)
here? I think that would be more clear, but I don't want to do that if that's
not the Rust convention -->
<!-- The hyphenated version doesn't appear to be a general convention to me, it
looks like "reference counted" is most often not hyphenated. For example:
http://researcher.watson.ibm.com/researcher/files/us-bacon/Bacon01Concurrent.pdf
 We'd be interested to know if there's a standard that we don't know about
/Carol -->

* `Box<T>`，用于在堆上分配值
* `Rc<T>`，一个引用计数类型，其数据可以有多个所有者
* `Ref<T>` 和 `RefMut<T>`，通过 `RefCell<T>` 访问，一个在运行时而不是在编译时执行借用规则的类型。

<!-- Should we add Ref and RefMut to this list, too? -->
<!-- They were already sort of in the list; we've flipped the order to make it
clearer /Carol-->

同时我们会涉及 **内部可变性**（*interior mutability*）模式，这时不可变类型暴露出改变其内部值的 API。我们也会讨论 **引用循环**（*reference cycles*）会如何泄露内存，以及如何避免。

让我们开始吧！
