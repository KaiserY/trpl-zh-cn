## `panic!` 与不可恢复的错误

> [ch09-01-unrecoverable-errors-with-panic.md](https://github.com/rust-lang/book/blob/master/src/ch09-01-unrecoverable-errors-with-panic.md)
> <br>
> commit 426f3e4ec17e539ae9905ba559411169d303a031

突然有一天，代码出问题了，而你对此束手无策。对于这种情况，Rust 有 `panic!`宏。当执行这个宏时，程序会打印出一个错误信息，展开并清理栈数据，然后接着退出。出现这种情况的场景通常是检测到一些类型的 bug 而且程序员并不清楚该如何处理它。

> ### 对应 panic 时的栈展开或终止
> 
> 当出现 panic 时，程序默认会开始 **展开**（*unwinding*），这意味着 Rust 会回溯栈并清理它遇到的每一个函数的数据，不过这个回溯并清理的过程有很多工作。另一种选择是直接 **终止**（*abort*），这会不清理数据就退出程序。那么程序所使用的内存需要由操作系统来清理。如果你需要项目的最终二进制文件越小越好，panic 时通过在  *Cargo.toml* 的 `[profile]` 部分增加 `panic = 'abort'`，可以由展开切换为终止。例如，如果你想要在release模式中 panic 时直接终止：
>
> ```toml
> [profile.release]
> panic = 'abort'
> ```

让我们在一个简单的程序中调用 `panic!`：

<span class="filename">文件名: src/main.rs</span>

```rust,should_panic,panics
fn main() {
    panic!("crash and burn");
}
```

运行程序将会出现类似这样的输出：

```text
$ cargo run
   Compiling panic v0.1.0 (file:///projects/panic)
    Finished dev [unoptimized + debuginfo] target(s) in 0.25s
     Running `target/debug/panic`
thread 'main' panicked at 'crash and burn', src/main.rs:2:5
note: Run with `RUST_BACKTRACE=1` for a backtrace.
```

最后两行包含 `panic!` 调用造成的错误信息。第一行显示了 panic 提供的信息并指明了源码中 panic 出现的位置：*src/main.rs:2:5* 表明这是 *src/main.rs* 文件的第二行第五个字符。

在这个例子中，被指明的那一行是我们代码的一部分，而且查看这一行的话就会发现 `panic!` 宏的调用。在其他情况下，`panic!` 可能会出现在我们的代码调用的代码中。错误信息报告的文件名和行号可能指向别人代码中的 `panic!` 宏调用，而不是我们代码中最终导致 `panic!` 的那一行。我们可以使用 `panic!` 被调用的函数的 backtrace 来寻找代码中出问题的地方。下面我们会详细介绍 backtrace 是什么。

### 使用 `panic!` 的 backtrace

让我们来看看另一个因为我们代码中的 bug 引起的别的库中 `panic!` 的例子，而不是直接的宏调用。示例 9-1 有一些尝试通过索引访问 vector 中元素的例子：

<span class="filename">文件名: src/main.rs</span>

```rust,should_panic,panics
fn main() {
    let v = vec![1, 2, 3];

    v[99];
}
```

<span class="caption">示例 9-1：尝试访问超越 vector 结尾的元素，这会造成 `panic!`</span>

这里尝试访问 vector 的第一百个元素（这里的索引是 99 因为索引从 0 开始），不过它只有三个元素。这种情况下 Rust 会 panic。`[]` 应当返回一个元素，不过如果传递了一个无效索引，就没有可供 Rust 返回的正确的元素。

这种情况下其他像 C 这样语言会尝试直接提供所要求的值，即便这可能不是你期望的：你会得到任何对应 vector 中这个元素的内存位置的值，甚至是这些内存并不属于 vector 的情况。这被称为 **缓冲区溢出**（*buffer overread*），并可能会导致安全漏洞，比如攻击者可以像这样操作索引来读取储存在数组后面不被允许的数据。

为了使程序远离这类漏洞，如果尝试读取一个索引不存在的元素，Rust 会停止执行并拒绝继续。尝试运行上面的程序会出现如下：

```text
$ cargo run
   Compiling panic v0.1.0 (file:///projects/panic)
    Finished dev [unoptimized + debuginfo] target(s) in 0.27s
     Running `target/debug/panic`
thread 'main' panicked at 'index out of bounds: the len is 3 but the index is 99', libcore/slice/mod.rs:2448:10
note: Run with `RUST_BACKTRACE=1` for a backtrace.
```

这指向了一个不是我们编写的文件，*vec.rs*。这是标准库中 `Vec<T>` 的实现。这是当对 vector `v` 使用 `[]` 时 *vec.rs* 中会执行的代码，也是真正出现 `panic!` 的地方。

接下来的几行提醒我们可以设置 `RUST_BACKTRACE` 环境变量来得到一个 backtrace *backtrace* 是一个执行到目前位置所有被调用的函数的列表。Rust 的 backtrace 跟其他语言中的一样：阅读 backtrace 的关键是从头开始读直到发现你编写的文件。这就是问题的发源地。这一行往上是你的代码调用的代码；往下则是调用你的代码的代码。这些行可能包含核心 Rust 代码，标准库代码或用到的 crate 代码。让我们将 `RUST_BACKTRACE` 环境变量设置为任何不是 0 的值来获取 backtrace 看看。示例 9-2 展示了与你看到类似的输出：

```text
$ RUST_BACKTRACE=1 cargo run
    Finished dev [unoptimized + debuginfo] target(s) in 0.00s
     Running `target/debug/panic`
thread 'main' panicked at 'index out of bounds: the len is 3 but the index is 99', libcore/slice/mod.rs:2448:10
stack backtrace:
   0: std::sys::unix::backtrace::tracing::imp::unwind_backtrace
             at libstd/sys/unix/backtrace/tracing/gcc_s.rs:49
   1: std::sys_common::backtrace::print
             at libstd/sys_common/backtrace.rs:71
             at libstd/sys_common/backtrace.rs:59
   2: std::panicking::default_hook::{{closure}}
             at libstd/panicking.rs:211
   3: std::panicking::default_hook
             at libstd/panicking.rs:227
   4: <std::panicking::begin_panic::PanicPayload<A> as core::panic::BoxMeUp>::get
             at libstd/panicking.rs:476
   5: std::panicking::continue_panic_fmt
             at libstd/panicking.rs:390
   6: std::panicking::try::do_call
             at libstd/panicking.rs:325
   7: core::ptr::drop_in_place
             at libcore/panicking.rs:77
   8: core::ptr::drop_in_place
             at libcore/panicking.rs:59
   9: <usize as core::slice::SliceIndex<[T]>>::index
             at libcore/slice/mod.rs:2448
  10: core::slice::<impl core::ops::index::Index<I> for [T]>::index
             at libcore/slice/mod.rs:2316
  11: <alloc::vec::Vec<T> as core::ops::index::Index<I>>::index
             at liballoc/vec.rs:1653
  12: panic::main
             at src/main.rs:4
  13: std::rt::lang_start::{{closure}}
             at libstd/rt.rs:74
  14: std::panicking::try::do_call
             at libstd/rt.rs:59
             at libstd/panicking.rs:310
  15: macho_symbol_search
             at libpanic_unwind/lib.rs:102
  16: std::alloc::default_alloc_error_hook
             at libstd/panicking.rs:289
             at libstd/panic.rs:392
             at libstd/rt.rs:58
  17: std::rt::lang_start
             at libstd/rt.rs:74
  18: panic::main
```

<span class="caption">示例 9-2：当设置 `RUST_BACKTRACE` 环境变量时 `panic!` 调用所生成的 backtrace 信息</span>

这里有大量的输出！你实际看到的输出可能因不同的操作系统和 Rust 版本而有所不同。为了获取带有这些信息的 backtrace，必须启用 debug 标识。当不使用 `--release` 参数运行 cargo build 或 cargo run 时 debug 标识会默认启用，就像这里一样。

示例 9-2 的输出中，backtrace 的 12 行指向了我们项目中造成问题的行：*src/main.rs* 的第 4 行。如果你不希望程序 panic，第一个提到我们编写的代码行的位置是你应该开始调查的，以便查明是什么值如何在这个地方引起了 panic。在示例 9-1 中，我们故意编写会 panic 的代码来演示如何使用 backtrace，修复这个 panic 的方法就是不要尝试在一个只包含三个项的 vector 中请求索引是 100 的元素。当将来你的代码出现了 panic，你需要搞清楚在这特定的场景下代码中执行了什么操作和什么值导致了 panic，以及应当如何处理才能避免这个问题。

本章后面的小节 [“panic! 还是不 panic!”][to-panic-or-not-to-panic] 会再次回到 `panic!` 会回到 `panic!` 并讲解何时应该何时不应该使用 `panic!` 来处理错误情况。接下来，我们来看看如何使用 `Result` 来从错误中恢复。

[to-panic-or-not-to-panic]:
ch09-03-to-panic-or-not-to-panic.html#to-panic-or-not-to-panic