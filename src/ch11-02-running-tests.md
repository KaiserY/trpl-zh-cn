## 控制测试如何运行

> [ch11-02-running-tests.md](https://github.com/rust-lang/book/blob/main/src/ch11-02-running-tests.md)
> <br>
> commit 34314c10f699cc882d4e0b06f2a24bd37a5435f2

就像 `cargo run` 会编译代码并运行生成的二进制文件一样，`cargo test` 在测试模式下编译代码并运行生成的测试二进制文件。`cargo test` 产生的二进制文件的默认行为是并发运行所有的测试，并截获测试运行过程中产生的输出，阻止它们被显示出来，使得阅读测试结果相关的内容变得更容易。不过可以指定命令行参数来改变 `cargo test` 的默认行为。

可以将一部分命令行参数传递给 `cargo test`，而将另外一部分传递给生成的测试二进制文件。为了分隔这两种参数，需要先列出传递给 `cargo test` 的参数，接着是分隔符 `--`，再之后是传递给测试二进制文件的参数。运行 `cargo test --help` 会提示 `cargo test` 的有关参数，而运行 `cargo test -- --help` 可以提示在分隔符之后使用的有关参数。

### 并行或连续的运行测试

当运行多个测试时，Rust 默认使用线程来并行运行。这意味着测试会更快地运行完毕，所以你可以更快的得到代码能否工作的反馈。因为测试是在同时运行的，你应该确保测试不能相互依赖，或依赖任何共享的状态，包括依赖共享的环境，比如当前工作目录或者环境变量。

举个例子，每一个测试都运行一些代码，假设这些代码都在硬盘上创建一个 *test-output.txt* 文件并写入一些数据。接着每一个测试都读取文件中的数据并断言这个文件包含特定的值，而这个值在每个测试中都是不同的。因为所有测试都是同时运行的，一个测试可能会在另一个测试读写文件过程中修改了文件。那么第二个测试就会失败，并不是因为代码不正确，而是因为测试并行运行时相互干扰。一个解决方案是使每一个测试读写不同的文件；另一个解决方案是一次运行一个测试。

如果你不希望测试并行运行，或者想要更加精确的控制线程的数量，可以传递 `--test-threads` 参数和希望使用线程的数量给测试二进制文件。例如：

```console
$ cargo test -- --test-threads=1
```

这里将测试线程设置为 `1`，告诉程序不要使用任何并行机制。这也会比并行运行花费更多时间，不过在有共享的状态时，测试就不会潜在的相互干扰了。

### 显示函数输出

默认情况下，当测试通过时，Rust 的测试库会截获打印到标准输出的所有内容。比如在测试中调用了 `println!` 而测试通过了，我们将不会在终端看到 `println!` 的输出：只会看到说明测试通过的提示行。如果测试失败了，则会看到所有标准输出和其他错误信息。

例如，示例 11-10 有一个无意义的函数，它打印出其参数的值并接着返回 10。接着还有一个会通过的测试和一个会失败的测试：

<span class="filename">文件名：src/lib.rs</span>

```rust,panics,noplayground
{{#rustdoc_include ../listings/ch11-writing-automated-tests/listing-11-10/src/lib.rs}}
```

<span class="caption">示例 11-10：一个调用了 `println!` 的函数的测试</span>

运行 `cargo test` 将会看到这些测试的输出：

```console
{{#include ../listings/ch11-writing-automated-tests/listing-11-10/output.txt}}
```

注意输出中不会出现测试通过时打印的内容，即 `I got the value 4`。因为当测试通过时，这些输出会被截获。失败测试的输出 `I got the value 8` ，则出现在输出的测试摘要部分，同时也显示了测试失败的原因。

如果你希望也能看到通过的测试中打印的值，也可以在结尾加上 `--show-output` 告诉 Rust 显示成功测试的输出。

```console
$ cargo test -- --show-output
```

使用 `--show-output` 参数再次运行示例 11-10 中的测试会显示如下输出：

```console
{{#include ../listings/ch11-writing-automated-tests/output-only-01-show-output/output.txt}}
```

### 通过指定名字来运行部分测试

有时运行整个测试集会耗费很长时间。如果你负责特定位置的代码，你可能会希望只运行与这些代码相关的测试。你可以向 `cargo test` 传递所希望运行的测试名称的参数来选择运行哪些测试。

为了展示如何运行部分测试，示例 11-11 为 `add_two` 函数创建了三个测试，我们可以选择具体运行哪一个：

<span class="filename">文件名：src/lib.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch11-writing-automated-tests/listing-11-11/src/lib.rs}}
```

<span class="caption">示例 11-11：不同名称的三个测试</span>

如果没有传递任何参数就运行测试，如你所见，所有测试都会并行运行：

```console
{{#include ../listings/ch11-writing-automated-tests/listing-11-11/output.txt}}
```

#### 运行单个测试

可以向 `cargo test` 传递任意测试的名称来只运行这个测试：

```console
{{#include ../listings/ch11-writing-automated-tests/output-only-02-single-test/output.txt}}
```

只有名称为 `one_hundred` 的测试被运行了；因为其余两个测试并不匹配这个名称。测试输出在摘要行的结尾显示了 `2 filtered out` 表明还存在比本次所运行的测试更多的测试没有被运行。

不能像这样指定多个测试名称；只有传递给 `cargo test` 的第一个值才会被使用。不过有运行多个测试的方法。

#### 过滤运行多个测试

我们可以指定部分测试的名称，任何名称匹配这个名称的测试会被运行。例如，因为头两个测试的名称包含 `add`，可以通过 `cargo test add` 来运行这两个测试：

```console
{{#include ../listings/ch11-writing-automated-tests/output-only-03-multiple-tests/output.txt}}
```

这运行了所有名字中带有 `add` 的测试，也过滤掉了名为 `one_hundred` 的测试。同时注意测试所在的模块也是测试名称的一部分，所以可以通过模块名来运行一个模块中的所有测试。

### 除非特别指定否则忽略某些测试

有时一些特定的测试执行起来是非常耗费时间的，所以在大多数运行 `cargo test` 的时候希望能排除它们。虽然可以通过参数列举出所有希望运行的测试来做到，也可以使用 `ignore` 属性来标记耗时的测试并排除它们，如下所示：

<span class="filename">文件名：src/lib.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch11-writing-automated-tests/no-listing-11-ignore-a-test/src/lib.rs}}
```

对于想要排除的测试，我们在 `#[test]` 之后增加了 `#[ignore]` 行。现在如果运行测试，就会发现 `it_works` 运行了，而 `expensive_test` 没有运行：

```console
{{#include ../listings/ch11-writing-automated-tests/no-listing-11-ignore-a-test/output.txt}}
```

`expensive_test` 被列为 `ignored`，如果我们只希望运行被忽略的测试，可以使用 `cargo test -- --ignored`：

```console
{{#include ../listings/ch11-writing-automated-tests/output-only-04-running-ignored/output.txt}}
```

通过控制运行哪些测试，你可以确保能够快速地运行 `cargo test` 。当你需要运行 `ignored` 的测试时，可以执行 `cargo test -- --ignored`。如果你希望不管是否忽略都要运行全部测试，可以运行 `cargo test -- --include-ignored`。
