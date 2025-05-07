**任务说明：**

作为一名专业翻译，同时精通 Rust 编程语言，你的任务是对提供的英文原文进行校对，并确保中文翻译的准确性。

**要求：**

1. **格式保留**：在校对过程中，请尽量保持原有中文翻译的格式和结构。
2. **术语保留**：对于中文翻译中出现的英文专业术语，不要进行翻译，直接保留原文。
3. **校对标准**：在校对时，请依据英文原文对中文翻译进行全面检查，确保准确传达原文的含义。
4. **专业性**：请尊重专业领域的翻译技巧，避免简单直译，而是根据上下文做出最适当的调整。

**输入：**

- 英文原文：

```
Notice that we don’t include the `unsafe` keyword in this code. We can create
raw pointers in safe code; we just can’t dereference raw pointers outside an
unsafe block, as you’ll see in a bit.

We’ve created raw pointers by using the raw borrow operators: `&raw const num`
creates a `*const i32` immutable raw pointer, and `&raw mut num` creates a `*mut
i32` mutable raw pointer. Because we created them directly from a local
variable, we know these particular raw pointers are valid, but we can’t make
that assumption about just any raw pointer.

To demonstrate this, next we’ll create a raw pointer whose validity we can’t be
so certain of, using `as` to cast a value instead of using the raw borrow
operators. Listing 20-2 shows how to create a raw pointer to an arbitrary
location in memory. Trying to use arbitrary memory is undefined: there might be
data at that address or there might not, the compiler might optimize the code so
there is no memory access, or the program might terminate with a segmentation
fault. Usually, there is no good reason to write code like this, especially in
cases where you can use a raw borrow operator instead, but it is possible.
```

- 中文翻译：

```
注意这里没有引入 `unsafe` 关键字。可以在安全代码中 **创建** 裸指针，只是不能在不安全块之外 **解引用** 裸指针，稍后便会看到。

这里使用 `as` 将不可变和可变引用强转为对应的裸指针类型。因为直接从保证安全的引用来创建它们，可以知道这些特定的裸指针是有效，但是不能对任何裸指针做出如此假设。

作为展示接下来会创建一个不能确定其有效性的裸指针，示例 19-2 展示了如何创建一个指向任意内存地址的裸指针。尝试使用任意内存是未定义行为：此地址可能有数据也可能没有，编译器可能会优化掉这个内存访问，或者程序可能会出现段错误（segmentation fault）。通常没有好的理由编写这样的代码，不过却是可行的：
```

**输出：**

- 中文翻译校对：

```

```
