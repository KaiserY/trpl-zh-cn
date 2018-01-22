## 测试的组织结构

> [ch11-03-test-organization.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch11-03-test-organization.md)
> <br>
> commit b3eddb8edc0c3f83647143673d18efac0a44083a

正如之前提到的，测试是一个复杂的概念，而且不同的开发者也采用不同的技术和组织。Rust 社区倾向于根据测试的两个主要分类来考虑问题：**单元测试**（*unit tests*）与 **集成测试**（*integration tests*）。单元测试倾向于更小而更专注，在隔离的环境中一次测试一个模块，也可以测试私有接口。集成测试对于你的库来说则完全是外部的。他们与其他用户采用相同的方式使用你的代码，他们只针对公有接口而且每个测试都会测试多个模块。

编写这两类测试对于从独立和整体的角度保证你的库符合期望是非常重要的。

### 单元测试

单元测试的目的是在与其他部分隔离的环境中测试每一个单元的代码，以便于快速而准确的定位代码位于何处和是否符合预期。单元测试位于 *src* 目录中，与他们要测试的代码存在于相同的文件中。传统做法是在每个文件中创建包含测试函数的 `tests` 模块，并使用 `cfg(test)` 标注模块。

#### 测试模块和 `cfg(test)`

测试模块的 `#[cfg(test)]` 注解告诉 Rust 只在执行 `cargo test` 时才编译和运行测试代码，而在运行 `cargo build` 时不这么做。这在只希望构建库的时候可以节省编译时间，并能节省编译产物的空间因为他们并没有包含测试。我们将会看到因为集成测试位于另一个文件夹，他们并不需要 `#[cfg(test)]` 注解。但是因为单元测试位于与源码相同的文件中，所以使用 `#[cfg(test)]` 来指定他们不应该被包含进编译结果中。

还记得本章第一部分新建的 `adder` 项目吗？Cargo 为我们生成了如下代码：

<span class="filename">文件名: src/lib.rs</span>

```rust
#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}
```

这里自动生成了测试模块。`cfg` 属性代表 *configuration* ，它告诉 Rust 其之后的项只被包含进特定配置中。在这个例子中，配置是 `test`，Rust 所提供的用于编译和运行测试的配置。通过使用这个属性，Cargo 只会在我们主动使用 `cargo test` 运行测试时才编译测试代码。除了标注为 `#[test]` 的函数之外，还包括测试模块中可能存在的帮助函数。

#### 测试私有函数

测试社区中一直存在关于是否应该对私有函数进行单元测试的论战，而其他语言中难以甚至不可能测试私有函数。不过无论你坚持哪种测试意识形态，Rust 的私有性规则确实允许你测试私有函数，由于私有性规则。考虑示例 11-12 中带有私有函数 `internal_adder` 的代码：

<span class="filename">文件名: src/lib.rs</span>

```rust
pub fn add_two(a: i32) -> i32 {
    internal_adder(a, 2)
}

fn internal_adder(a: i32, b: i32) -> i32 {
    a + b
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn internal() {
        assert_eq!(4, internal_adder(2, 2));
    }
}
```

<span class="caption">示例 11-12：测试私有函数</span>

注意 `internal_adder` 函数并没有标记为 `pub`，不过因为测试也不过是 Rust 代码同时 `tests` 也仅仅是另一个模块，我们完全可以在测试中导入和调用 `internal_adder`。如果你并不认为私有函数应该被测试，Rust 也不会强迫你这么做。

### 集成测试

在 Rust 中，集成测试对于需要测试的库来完全说是外部的。他们同其他代码一样使用库文件，这意味着他们只能调用作为库公有 API 的一部分函数。他们的目的是测试库的多个部分能否一起正常工作。每个能单独正确运行的代码单元集成在一起也可能会出现问题，所以集成测试的覆盖率也是很重要的。为了创建集成测试，首先需要一个 *tests* 目录。

#### *tests* 目录

为了编写集成测试，需要在项目根目录创建一个 *tests* 目录，与 *src* 同级。Cargo 知道如何去寻找这个目录中的集成测试文件。接着可以随意在这个目录中创建任意多的测试文件，Cargo 会将每一个文件当作单独的 crate 来编译。

让我们来创建一个集成测试！保留示例 11-12 中 *src/lib.rs* 的代码。创建一个 *tests* 目录，新建一个文件 *tests/integration_test.rs*，并输入示例 11-13 中的代码。

<span class="filename">文件名: tests/integration_test.rs</span>

```rust,ignore
extern crate adder;

#[test]
fn it_adds_two() {
    assert_eq!(4, adder::add_two(2));
}
```

<span class="caption">示例 11-13：一个 `adder` crate 中函数的集成测试</span>

我们在顶部增加了 `extern crate adder`，这在单元测试中是不需要的。这是因为每一个 `tests` 目录中的测试文件都是完全独立的 crate，所以需要在每一个文件中导入库。

并不需要将 *tests/integration_test.rs* 中的任何代码标注为 `#[cfg(test)]`。Cargo 对 `tests` 文件夹特殊处理并只会在运行 `cargo test` 时编译这个目录中的文件。现在就运行 `cargo test` 试试：

```text
$ cargo test
   Compiling adder v0.1.0 (file:///projects/adder)
    Finished dev [unoptimized + debuginfo] target(s) in 0.31 secs
     Running target/debug/deps/adder-abcabcabc

running 1 test
test tests::internal ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out

     Running target/debug/deps/integration_test-ce99bcc2479f4607

running 1 test
test it_adds_two ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out

   Doc-tests adder

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

现在有了三个部分的输出：单元测试、集成测试和文档测试。第一部分单元测试与我们之前见过的一样：每一个单元测试一行（示例 11-12 中有一个叫做 `internal` 的测试），接着是一个单元测试的总结行。

集成测试部分以行 `Running target/debug/deps/integration-test-ce99bcc2479f4607`（输出最后的哈希值可能不同）开头。接着是每一个集成测试中的测试函数一行，以及一个就在 `Doc-tests adder` 部分开始之前的集成测试的总结行。

注意在任意 *src* 文件中增加更多单元测试函数会增加更多单元测试部分的测试结果行。在我们创建的集成测试文件中增加更多测试函数会增加更多集成测试部分的行。每一个集成测试文件有其自己的部分，所以如果在 *tests* 目录中增加更多文件，这里就会有更多集成测试部分。

我们仍然可以通过指定测试函数的名称作为 `cargo test` 的参数来运行特定集成测试。为了运行某个特定集成测试文件中的所有测试，使用 `cargo test` 的 `--test` 后跟文件的名称：

```text
$ cargo test --test integration_test
    Finished dev [unoptimized + debuginfo] target(s) in 0.0 secs
     Running target/debug/integration_test-952a27e0126bb565

running 1 test
test it_adds_two ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

这些只是 *tests* 目录中我们指定的文件中的测试。

#### 集成测试中的子模块

随着集成测试的增加，你可能希望在 `tests` 目录增加更多文件辅助组织他们，例如根据测试的功能来将测试分组。正如我们之前提到的，每一个 *tests* 目录中的文件都被编译为单独的 crate。

将每个集成测试文件当作其自己的 crate 来对待有助于创建更类似与终端用户使用 crate 那样的单独的作用域。然而，这意味着考虑到第七章学习的如何将代码分隔进模块和文件的知识，*tests* 目录中的文件不能像 *src* 中的文件那样共享相同的行为。

对于 *tests* 目录中不同文件的行为，通常在如果有一系列有助于多个集成测试文件的帮助函数，而你尝试遵循第七章 “将模块移动到其他文件” 部分的步骤将他们提取到一个通用的模块中时显得很明显。例如，如果我们创建了 *tests/common.rs* 并将 `setup` 函数放入其中，这里将放入一些我们希望能够在多个测试文件的多个测试函数中调用的代码：

<span class="filename">文件名: tests/common.rs</span>

```rust
pub fn setup() {
    // setup code specific to your library's tests would go here
}
```

如果再次运行测试，将会在测试结果中看到一个对应 *common.rs* 文件的新部分，即便这个文件并没有包含任何测试函数，或者没有任何地方调用了 `setup` 函数：

```text
running 1 test
test tests::internal ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out

     Running target/debug/deps/common-b8b07b6f1be2db70

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out

     Running target/debug/deps/integration_test-d993c68b431d39df

running 1 test
test it_adds_two ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out

   Doc-tests adder

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

`common` 出现在测试结果中并显示 `running 0 tests`，这不是我们想要的；我们只是希望能够在其他集成测试文件中分享一些代码罢了。

为了避免 `common` 出现在测试输出中，不同于创建 *tests/common.rs*，我们将创建 *tests/common/mod.rs*。在第七章的 “模块文件系统规则” 部分，对于拥有子模块的模块文件使用了 *module_name/mod.rs* 命名规范，虽然这里 `common` 并没有子模块，但是这样命名告诉 Rust 不要将 `common` 看作一个集成测试文件。当将 `setup` 代码移动到 *tests/common/mod.rs* 并去掉 *tests/common.rs* 文件之后，测试输出中将不会出现这一部分。*tests* 目录中的子目录不会被作为单独的 crate 编译或作为一部分出现在测试输出中。

一旦拥有了 *tests/common/mod.rs*，就可以将其作为模块来在任何集成测试文件中使用。这里是一个 *tests/integration_test.rs* 中调用 `setup` 函数的 `it_adds_two` 测试的例子：

<span class="filename">文件名: tests/integration_test.rs</span>

```rust,ignore
extern crate adder;

mod common;

#[test]
fn it_adds_two() {
    common::setup();
    assert_eq!(4, adder::add_two(2));
}
```

注意 `mod common;` 声明与示例 7-4 中展示的模块声明相同。接着在测试函数中就可以调用 `common::setup()` 了。

#### 二进制 crate 的集成测试

如果项目是二进制 crate 并且只包含 *src/main.rs* 而没有 *src/lib.rs*，这样就不可能在 *tests* 创建集成测试并使用 `extern crate` 导入 *src/main.rs* 中的函数了。只有库 crate 向其他 crate 暴露了可供调用和使用的函数；二进制 crate 只意在单独运行。

这也是 Rust 二进制项目明确采用 *src/main.rs* 调用 *src/lib.rs* 中逻辑这样的结构的原因之一。通过这种结构，集成测试 **就可以** 使用 `extern crate` 测试库 crate 中的主要功能了，而如果这些重要的功能没有问题的话，*src/main.rs* 中的少量代码也就会正常工作且不需要测试。

## 总结

Rust 的测试功能提供了一个如何确保即使函数做出改变也能继续以期望的方式运行的途径。单元测试独立的验证库的不同部分并能够测试私有实现细节。集成测试则涉及多个部分结合起来工作时的用例，并像其他外部代码那样测试库的公有 API。即使 Rust 的类型系统和所有权规则可以帮助避免一些 bug，不过测试对于减少代码是否符合期望相关的逻辑 bug 仍然是很重要的。

接下来让我们结合本章所学和其他之前章节的知识，在下一章一起编写一个项目！
