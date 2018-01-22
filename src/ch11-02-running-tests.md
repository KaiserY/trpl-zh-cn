## 控制测试如何运行

> [ch11-02-running-tests.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch11-02-running-tests.md)
> <br>
> commit 550c8ea6f74060ff1f7b67e7e1878c4da121682d

就像 `cargo run` 会编译代码并运行生成的二进制文件一样，`cargo test` 在测试模式下编译代码并运行生成的测试二进制文件。可以指定命令行参数来改变 `cargo test` 的默认行为。例如，`cargo test` 生成的二进制文件的默认行为是并行的运行所有测试，并捕获测试运行过程中产生的输出避免他们被显示出来，使得阅读测试结果相关的内容变得更容易。

这些选项的一部分可以传递给 `cargo test`，而另一些则需要传递给生成的测试二进制文件。为了分隔两种类型的参数，首先列出传递给 `cargo test` 的参数，接着是分隔符 `--`，再之后是传递给测试二进制文件的参数。运行 `cargo test --help` 会告诉你 `cargo test` 的相关参数，而运行 `cargo test -- --help` 则会告诉你位于分隔符 `--` 之后的相关参数。

### 并行或连续的运行测试

当运行多个测试时，他们默认使用线程来并行的运行。这意味着测试会更快的运行完毕，所以可以更快的得到代码能否工作的反馈。因为测试是在同时运行的，你应该小心测试不能相互依赖或依赖任何共享状态，这包括类似于当前工作目录或者环境变量这样的共享环境。

例如，每一个测试都运行一些代码在硬盘上创建一个 `test-output.txt` 文件并写入一些数据。接着每一个测试都读取文件中的数据并断言这个文件包含特定的值，而这个值在每个测试中都是不同的。因为所有测试都是同时运行的，一个测试可能会在另一个测试读写文件过程中覆盖了文件。那么第二个测试就会失败，并不是因为代码不正确，而是因为测试并行运行时相互干涉。一个解决方案是使每一个测试读写不同的文件；另一个是一次运行一个测试。

如果你不希望测试并行运行，或者想要更加精确的控制使用线程的数量，可以传递 `--test-threads` 参数和希望使用线程的数量给测试二进制文件。例如：

```text
$ cargo test -- --test-threads=1
```

这里将测试线程设置为 1，告诉程序不要使用任何并行机制。这也会比并行运行花费更多时间，不过测试就不会在存在共享状态时潜在的相互干涉了。

### 显示函数输出

如果测试通过了，Rust 的测试库默认会捕获打印到标准输出的任何内容。例如，如果在测试中调用 `println!` 而测试通过了，我们将不会在终端看到 `println!` 的输出：只会看到说明测试通过的行。如果测试失败了，就会看到所有标准输出和其他错误信息。

例如，示例 11-10 有一个无意义的函数它打印出其参数的值并接着返回 10。接着还有一个会通过的测试和一个会失败的测试：

<span class="filename">文件名: src/lib.rs</span>

```rust
fn prints_and_returns_10(a: i32) -> i32 {
    println!("I got the value {}", a);
    10
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn this_test_will_pass() {
        let value = prints_and_returns_10(4);
        assert_eq!(10, value);
    }

    #[test]
    fn this_test_will_fail() {
        let value = prints_and_returns_10(8);
        assert_eq!(5, value);
    }
}
```

<span class="caption">示例 11-10：一个调用了 `println!` 的函数的测试</span>

运行 `cargo test` 将会看到这些测试的输出：

```text
running 2 tests
test tests::this_test_will_pass ... ok
test tests::this_test_will_fail ... FAILED

failures:

---- tests::this_test_will_fail stdout ----
        I got the value 8
thread 'tests::this_test_will_fail' panicked at 'assertion failed: `(left == right)`
  left: `5`,
 right: `10`', src/lib.rs:19:8
note: Run with `RUST_BACKTRACE=1` for a backtrace.

failures:
    tests::this_test_will_fail

test result: FAILED. 1 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out
```

注意输出中哪里也不会出现 `I got the value 4`，这是当测试通过时打印的内容。这些输出被捕获。失败测试的输出，`I got the value 8`，则出现在输出的测试总结部分，同时也显示了测试失败的原因。

如果你希望也能看到通过的测试中打印的值，捕获输出的行为可以通过 `--nocapture` 参数来禁用：

```text
$ cargo test -- --nocapture
```

使用 `--nocapture` 参数再次运行示例 11-10 中的测试会显示如下输出：

```text
running 2 tests
I got the value 4
I got the value 8
test tests::this_test_will_pass ... ok
thread 'tests::this_test_will_fail' panicked at 'assertion failed: `(left == right)`
  left: `5`,
 right: `10`', src/lib.rs:19:8
note: Run with `RUST_BACKTRACE=1` for a backtrace.
test tests::this_test_will_fail ... FAILED

failures:

failures:
    tests::this_test_will_fail

test result: FAILED. 1 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out
```

注意测试的输出和测试结果的输出是相互交叉的；这是由于上一部分讲到的测试是并行运行的。尝试一同使用 `--test-threads=1` 和 `--nocapture` 功能来看看输出是什么样子！

### 通过名称来运行测试的子集

有时运行整个测试集会耗费很长时间。如果你负责特定位置的代码，你可能会希望只运行这些代码相关的测试。可以向 `cargo test` 传递希望运行的测试的（部分）名称作为参数来选择运行哪些测试。

为了展示如何运行测试的子集，示例 11-11 为 `add_two` 函数创建了三个测试来供我们选择运行哪一个：

<span class="filename">文件名: src/lib.rs</span>

```rust
pub fn add_two(a: i32) -> i32 {
    a + 2
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn add_two_and_two() {
        assert_eq!(4, add_two(2));
    }

    #[test]
    fn add_three_and_two() {
        assert_eq!(5, add_two(3));
    }

    #[test]
    fn one_hundred() {
        assert_eq!(102, add_two(100));
    }
}
```

<span class="caption">示例 11-11：不同名称的三个测试</span>

如果没有传递任何参数就运行测试，如你所见，所有测试都会并行运行：

```text
running 3 tests
test tests::add_two_and_two ... ok
test tests::add_three_and_two ... ok
test tests::one_hundred ... ok

test result: ok. 3 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

#### 运行单个测试

可以向 `cargo test` 传递任意测试的名称来只运行这个测试：

```text
$ cargo test one_hundred
    Finished dev [unoptimized + debuginfo] target(s) in 0.0 secs
     Running target/debug/deps/adder-06a75b4a1f2515e9

running 1 test
test tests::one_hundred ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 2 filtered out
```

只有名称为 `one_hundred` 的测试被运行了；其余两个测试并不匹配这个名称。测试输出在总结行的结尾显示了 `2 filtered out` 表明存在比本命令所运行的更多的测试。

不能像这样指定多个测试名称，只有传递给 `cargo test` 的第一个值才会被使用。不过有运行多个测试的方法。

#### 过滤运行多个测试

然而，可以指定测试的部分名称，这样任何名称匹配这个值的测试会被运行。例如，因为头两个测试的名称包含 `add`，可以通过 `cargo test add` 来运行这两个测试：

```text
$ cargo test add
    Finished dev [unoptimized + debuginfo] target(s) in 0.0 secs
     Running target/debug/deps/adder-06a75b4a1f2515e9

running 2 tests
test tests::add_two_and_two ... ok
test tests::add_three_and_two ... ok

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured; 1 filtered out
```

这运行了所有名字中带有 `add` 的测试。同时注意测试所在的模块作为测试名称的一部分，所以可以通过模块名来过滤运行一个模块中的所有测试。

### 除非指定否则忽略某些测试

有时一些特定的测试执行起来是非常耗费时间的，所以在大多数运行 `cargo test` 的时候希望能排除他们。与其通过参数列举出所有希望运行的测试，也可以使用 `ignore` 属性来标记耗时的测试并排除他们，如下所示：

<span class="filename">文件名: src/lib.rs</span>

```rust
#[test]
fn it_works() {
    assert_eq!(2 + 2, 4);
}

#[test]
#[ignore]
fn expensive_test() {
    // code that takes an hour to run
}
```

对想要排除的测试的 `#[test]` 之后增加了 `#[ignore]` 行。现在如果运行测试，就会发现 `it_works` 运行了，而 `expensive_test` 没有运行：

```text
$ cargo test
   Compiling adder v0.1.0 (file:///projects/adder)
    Finished dev [unoptimized + debuginfo] target(s) in 0.24 secs
     Running target/debug/deps/adder-ce99bcc2479f4607

running 2 tests
test expensive_test ... ignored
test it_works ... ok

test result: ok. 1 passed; 0 failed; 1 ignored; 0 measured; 0 filtered out
```

`expensive_test` 被列为 `ignored`，如果只希望运行被忽略的测试，可以使用 `cargo test -- --ignored`：

```text
$ cargo test -- --ignored
    Finished dev [unoptimized + debuginfo] target(s) in 0.0 secs
     Running target/debug/deps/adder-ce99bcc2479f4607

running 1 test
test expensive_test ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 1 filtered out
```

通过控制运行哪些测试，可以确保运行 `cargo test` 的结果是快速的。当某个时刻需要检查 `ignored` 测试的结果而且你也有时间等待这个结果的话，可以选择执行 `cargo test -- --ignored`。