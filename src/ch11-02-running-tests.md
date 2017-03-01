## 运行测试

> [ch11-02-running-tests.md](https://github.com/rust-lang/book/blob/master/src/ch11-02-running-tests.md)
> <br>
> commit cf52d81371e24e14ce31a5582bfcb8c5b80d26cc

类似于`cargo run`会编译代码并运行生成的二进制文件，`cargo test`在测试模式下编译代码并运行生成的测试二进制文件。`cargo test`生成的二进制文件默认会并行的运行所有测试并在测试过程中捕获生成的输出，这样就更容易阅读测试结果的输出。

可以通过指定命令行选项来改变这些运行测试的默认行为。这些选项的一部分可以传递给`cargo test`，而另一些则需要传递给生成的测试二进制文件。分隔这些参数的方法是`--`：`cargo test`之后列出了传递给`cargo test`的参数，接着是分隔符`--`，之后是传递给测试二进制文件的参数。

### 并行运行测试

测试使用线程来并行运行。为此，编写测试时需要注意测试之间不要相互依赖或者存在任何共享状态。共享状态也可能包含在运行环境中，比如当前工作目录或者环境变量。

如果你不希望它这样运行，或者想要更加精确的控制使用线程的数量，可以传递`--test-threads`参数和线程的数量给测试二进制文件。将线程数设置为 1 意味着没有任何并行操作：

```
$ cargo test -- --test-threads=1
```

### 捕获测试输出

Rust 的测试库默认捕获并丢弃标准输出和标准错误中的输出，除非测试失败了。例如，如果在测试中调用了`println!`而测试通过了，你将不会在终端看到`println!`的输出。这个行为可以通过向测试二进制文件传递`--nocapture`参数来禁用：

```
$ cargo test -- --nocapture
```

### 通过名称来运行测试的子集

有时运行整个测试集会耗费很多时间。如果你负责特定位置的代码，你可能会希望只与这些代码相关的测试。`cargo test`有一个参数允许你通过指定名称来运行特定的测试。

列表 11-3 中创建了三个如下名称的测试：

<figure>
<span class="filename">Filename: src/lib.rs</span>

```rust
#[test]
fn add_two_and_two() {
    assert_eq!(4, 2 + 2);
}

#[test]
fn add_three_and_two() {
    assert_eq!(5, 3 + 2);
}

#[test]
fn one_hundred() {
    assert_eq!(102, 100 + 2);
}
```

<figcaption>

Listing 11-3: Three tests with a variety of names

</figcaption>
</figure>

使用不同的参数会运行不同的测试子集。没有参数的话，如你所见会运行所有的测试：

```
$ cargo test
    Finished debug [unoptimized + debuginfo] target(s) in 0.0 secs
     Running target/debug/deps/adder-abcabcabc

running 3 tests
test add_three_and_two ... ok
test one_hundred ... ok
test add_two_and_two ... ok

test result: ok. 3 passed; 0 failed; 0 ignored; 0 measured
```

可以传递任意测试的名称来只运行那个测试：

```
$ cargo test one_hundred
    Finished debug [unoptimized + debuginfo] target(s) in 0.0 secs
     Running target/debug/deps/adder-abcabcabc

running 1 test
test one_hundred ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured
```

也可以传递名称的一部分，`cargo test`会运行所有匹配的测试：

```
$ cargo test add
    Finished debug [unoptimized + debuginfo] target(s) in 0.0 secs
     Running target/debug/deps/adder-abcabcabc

running 2 tests
test add_three_and_two ... ok
test add_two_and_two ... ok

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured
```

模块名也作为测试名的一部分，所以类似的模块名也可以用来指定测试特定模块。例如，如果将我们的代码组织成一个叫`adding`的模块和一个叫`subtracting`的模块并分别带有测试，如列表 11-4 所示：

<figure>
<span class="filename">Filename: src/lib.rs</span>

```rust
mod adding {
    #[test]
    fn add_two_and_two() {
        assert_eq!(4, 2 + 2);
    }

    #[test]
    fn add_three_and_two() {
        assert_eq!(5, 3 + 2);
    }

    #[test]
    fn one_hundred() {
        assert_eq!(102, 100 + 2);
    }
}

mod subtracting {
    #[test]
    fn subtract_three_and_two() {
        assert_eq!(1, 3 - 2);
    }
}
```

<figcaption>

Listing 11-4: Tests in two modules named `adding` and `subtracting`

</figcaption>
</figure>

执行`cargo test`会运行所有的测试，而模块名会出现在输出的测试名中：

```
$ cargo test
    Finished debug [unoptimized + debuginfo] target(s) in 0.0 secs
     Running target/debug/deps/adder-abcabcabc

running 4 tests
test adding::add_two_and_two ... ok
test adding::add_three_and_two ... ok
test subtracting::subtract_three_and_two ... ok
test adding::one_hundred ... ok
```

运行`cargo test adding`将只会运行对应模块的测试而不会运行任何 subtracting 模块中的测试：

```
$ cargo test adding
    Finished debug [unoptimized + debuginfo] target(s) in 0.0 secs
     Running target/debug/deps/adder-abcabcabc

running 3 tests
test adding::add_three_and_two ... ok
test adding::one_hundred ... ok
test adding::add_two_and_two ... ok

test result: ok. 3 passed; 0 failed; 0 ignored; 0 measured
```

### 除非指定否则忽略某些测试

有时一些特定的测试执行起来是非常耗费时间的，所以对于大多数`cargo test`命令，我们希望能排除它。无需为`cargo test`创建一个用来在运行所有测试时排除特定测试的参数并每次都要记得使用它，我们可以对这些测试使用`ignore`属性：

<span class="filename">Filename: src/lib.rs</span>

```rust
#[test]
fn it_works() {
    assert!(true);
}

#[test]
#[ignore]
fn expensive_test() {
    // code that takes an hour to run
}
```

现在运行测试，将会发现`it_works`运行了，而`expensive_test`没有：

```
$ cargo test
   Compiling adder v0.1.0 (file:///projects/adder)
    Finished debug [unoptimized + debuginfo] target(s) in 0.24 secs
     Running target/debug/deps/adder-abcabcabc

running 2 tests
test expensive_test ... ignored
test it_works ... ok

test result: ok. 1 passed; 0 failed; 1 ignored; 0 measured

   Doc-tests adder

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured
```

我们可以通过`cargo test -- --ignored`来明确请求只运行那些耗时的测试：

```
$ cargo test -- --ignored
    Finished debug [unoptimized + debuginfo] target(s) in 0.0 secs
     Running target/debug/deps/adder-abcabcabc

running 1 test
test expensive_test ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured
```

通过这种方式，大部分时间运行`cargo test`将是快速的。当需要检查`ignored`测试的结果而且你也有时间等待这个结果的话，可以选择执行`cargo test -- --ignored`。