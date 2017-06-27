# 高级特性

我们已经走了很长的路! 现在我们已经学了使用Rust时99%的需要学习的内容. 在我们做第20章中的项目之前, 让我们来谈谈你可能会遇到的最后的1%的问题. 你可以随便跳过本章, 当你在实作中遇到这些问题时再回过头来学习也无妨; 我们将学习的在这里列出的特性在某些特定的情况下非常有用. 我们不想舍弃这些特性, 但你用到它们的时候确实不多.

本章将覆盖如下内容:

* Unsafe Rust: for when you need to opt out of some of Rust's guarantees and
  tell the compiler that you will be responsible for upholding the guarantees
  instead
* Advanced Lifetimes: Additional lifetime syntax for complex situations
* Advanced Traits: Associated Types, default type parameters, fully qualified
  syntax, supertraits, and the newtype pattern in relation to traits
* Advanced Types: some more about the newtype pattern, type aliases, the
  "never" type, and dynamically sized types
* Advanced Functions and Closures: function pointers and returning closures

It's a panoply of Rust features with something for everyone! Let's dive in!
