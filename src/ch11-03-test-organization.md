## 测试的组织结构

> [ch11-03-test-organization.md](https://github.com/rust-lang/book/blob/master/src/ch11-03-test-organization.md)
> <br>
> commit cf52d81371e24e14ce31a5582bfcb8c5b80d26cc

正如之前提到的，测试是一个很广泛的学科，而且不同的人有时也采用不同的技术和组织。Rust 社区倾向于根据测试的两个主要分类来考虑问题：**单元测试**（*unit tests*）与**集成测试**（*unit tests*）。单元测试倾向于更小而更专注，在隔离的环境中一次测试一个模块。他们也可以测试私有接口。集成测试对于你的库来说则完全是外部的。他们与其他用户使用相同的方式使用你得代码，他们只针对共有接口而且每个测试会测试多个模块。这两类测试对于从独立和整体的角度保证你的库符合期望是非常重要的。

### 单元测试

单元测试的目的是在隔离与其他部分的环境中测试每一个单元的代码，以便于快速而准确的定位何处的代码是否符合预期。单元测试位于 *src* 目录中，与他们要测试的代码存在于相同的文件中。他们被分离进每个文件中他们自有的`tests`模块中。

#### 测试模块和`cfg(test)`

通过将测试放进他们自己的模块并对该模块使用`cfg`注解，我们可以告诉 Rust 只在执行`cargo test`时才编译和运行测试代码。这在当我们只希望用`cargo build`编译库代码时可以节省编译时间，并减少编译产物的大小因为并没有包含测试。

还记得上一部分新建的`adder`项目吗？Cargo 为我们生成了如下代码：

<span class="filename">Filename: src/lib.rs</span>

```rust
#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
    }
}
```

我们忽略了模块相关的信息以便更关注模块中测试代码的机制，不过现在让我们看看测试周围的代码。

首先，这里有一个属性`cfg`。`cfg`属性让我们声明一些内容只在给定特定的**配置**（*configuration*）时才被包含进来。Rust 提供了`test`配置用来编译和运行测试。通过这个属性，Cargo 只会在尝试运行测试时才编译测试代码。

接下来，`tests`包含了所有测试函数，而我们的代码则位于`tests`模块之外。`tests`模块的名称是一个惯例，除此之外这是一个遵守第七章讲到的常见可见性规则的普通模块。因为这是一个内部模块，我们需要将要测试的代码引入作用域。这对于一个大的模块来说是很烦人的，所以这里经常使用全局导入。

从本章到现在，我们一直在为`adder`项目编写并没有实际调用任何代码的测试。现在让我们做一些改变！在 *src/lib.rs* 中，放入`add_two`函数和带有一个检验代码的测试的`tests`模块，如列表 11-5 所示：

<figure>
<span class="filename">Filename: src/lib.rs</span>

```rust
pub fn add_two(a: i32) -> i32 {
    a + 2
}

#[cfg(test)]
mod tests {
    use add_two;

    #[test]
    fn it_works() {
        assert_eq!(4, add_two(2));
    }
}
```

<figcaption>

Listing 11-5: Testing the function `add_two` in a child `tests` module

</figcaption>
</figure>

注意除了测试函数之外，我们还在`tests`模块中添加了`use add_two;`。这将我们想要测试的代码引入到了内部的`tests`模块的作用域中，正如任何内部模块需要做的那样。如果现在使用`cargo test`运行测试，它会通过：

```
running 1 test
test tests::it_works ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured
```

如果我们忘记将`add_two`函数引入作用域，将会得到一个 unresolved name 错误，因为`tests`模块并不知道任何关于`add_two`函数的信息：

```
error[E0425]: unresolved name `add_two`
 --> src/lib.rs:9:23
  |
9 |         assert_eq!(4, add_two(2));
  |                       ^^^^^^^ unresolved name
```

如果这个模块包含很多希望测试的代码，在测试中列出每一个`use`语句将是很烦人的。相反在测试子模块中使用`use super::*;`来一次将所有内容导入作用域中是很常见的。

#### 测试私有函数

测试社区中一直存在关于是否应该对私有函数进行单元测试的论战。不过无论你坚持哪种测试意识形态，Rust 确实允许你测试私有函数，由于私有性规则。考虑列表 11-6 中带有私有函数`internal_adder`的代码：

<figure>
<span class="filename">Filename: src/lib.rs</span>

```rust
pub fn add_two(a: i32) -> i32 {
    internal_adder(a, 2)
}

fn internal_adder(a: i32, b: i32) -> i32 {
    a + b
}

#[cfg(test)]
mod tests {
    use internal_adder;

    #[test]
    fn internal() {
        assert_eq!(4, internal_adder(2, 2));
    }
}
```

<figcaption>

Listing 11-6: Testing a private function

</figcaption>
</figure>

因为测试也不过是 Rust 代码而`tests`也只是另一个模块，我们完全可以在一个测试中导入并调用`internal_adder`。如果你并不认为私有函数应该被测试，Rust 也不会强迫你这么做。

### 集成测试

在 Rust 中，集成测试对于需要测试的库来说是完全独立。他们同其他代码一样使用库文件。他们的目的是测试库的个个部分结合起来能否正常工作。每个能正确运行的代码单元集成在一起也可能会出现问题，所以集成测试的覆盖率也是很重要的。

#### *tests* 目录

Cargo 支持位于 *tests* 目录中的集成测试。如果创建它并放入 Rust 源文件，Cargo 会将每一个文件当作单独的 crate 来编译。让我们试一试！

首先，在项目根目录创建一个 *tests* 目录，挨着 *src* 目录。接着新建一个文件 *tests/integration_test.rs*，并写入列表 11-7 中的代码：


<figure>
<span class="filename">Filename: tests/integration_test.rs</span>

```rust,ignore
extern crate adder;

#[test]
fn it_adds_two() {
    assert_eq!(4, adder::add_two(2));
}
```

<figcaption>

Listing 11-7: An integration test of a function in the `adder` crate

</figcaption>
</figure>

在开头使用了`extern crate adder`，单元测试中并不需要它。`tests`目录中的每一个测试文件都是完全独立的 crate，所以需要在每个文件中导入我们的库。这也就是为何`tests`是编写集成测试的绝佳场所：他们像任何其他用户那样，需要将库导入 crate 并只能使用公有 API。

这个文件中也不需要`tests`模块。除非运行测试否则整个文件夹都不会被编译，所以无需将任何部分标记为`#[cfg(test)]`。另外每个测试文件都被隔离进其自己的 crate 中，无需进一步隔离测试代码。

让我们运行集成测试，同样使用`cargo test`来运行：

```
$ cargo test
   Compiling adder v0.1.0 (file:///projects/adder)
     Running target/debug/deps/adder-abcabcabc

running 1 test
test tests::it_works ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured

     Running target/debug/integration_test-952a27e0126bb565

running 1 test
test it_adds_two ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured

   Doc-tests adder

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured
```

现在有了三个部分的输出：单元测试、集成测试和文档测试。注意当在任何 *src* 目录的文件中增加单元测试时，单元测试部分的对应输出也会增加。增加集成测试文件中的测试函数也会对应增加输出。如果在 *tests* 目录中增加集成测试**文件**，则会增加更多集成测试部分：一个文件对应一个部分。

为`cargo test`指定测试函数名称参数也会匹配集成测试文件中的函数。为了只运行某个特定集成测试文件中的所有测试，可以使用`cargo test`的`--test`参数：

```
$ cargo test --test integration_test
    Finished debug [unoptimized + debuginfo] target(s) in 0.0 secs
     Running target/debug/integration_test-952a27e0126bb565

running 1 test
test it_adds_two ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured
```

#### 集成测试中的子模块

随着集成测试的增加，你可能希望在 `tests` 目录增加更多文件，例如根据测试的功能来将测试分组。正如我们之前提到的，这是可以的，Cargo 会将每一个文件当作一个独立的 crate。

最终，可能会有一系列在所有集成测试中通用的帮助函数，例如建立通用场景的函数。如果你将这些函数提取到 *tests* 目录的一个文件中，比如说 *tests/common.rs*，则这个文件将会像这个目录中的其他包含测试的 Rust 文件一样被编译进一个单独的 crate 中。它也会作为一个独立的部分出现在测试输出中。因为这很可能不是你所希望的，所以建议在子目录中使用 *mod.rs* 文件，比如 *tests/common/mod.rs*，来放置帮助函数。*tests* 的子目录不会被作为单独的 crate 编译或者作为单独的部分出现在测试输出中。

#### 二进制 crate 的集成测试

如果项目是二进制 crate 并且只包含 *src/main.rs* 而没有 *src/lib.rs*，这样就不可能在 *tests* 创建集成测试并使用 `extern crate` 导入 *src/main.rs* 中的函数了。这也是 Rust 二进制项目明确采用 *src/main.rs* 调用 *src/lib.rs* 中逻辑的结构的原因之一。通过这种结构，集成测试**就可以**使用`extern crate`测试库 crate 中的主要功能，而如果这些功能没有问题的话，*src/main.rs* 中的少量代码也就会正常工作且不需要测试。

## 总结

Rust 的测试功能提供了一个确保即使改变代码函数也能继续以指定方式运行的途径。单元测试独立的验证库的每一部分并能够测试私有实现细节。集成测试则涉及多个部分结合起来时能否使用，并像其他代码那样测试库的公有 API。Rust 的类型系统和所有权规则可以帮助避免一些 bug，不过测试对于减少代码是否符合期望的逻辑 bug 是很重要的。

接下来让我们结合本章所学和其他之前章节的知识，在下一章一起编写一个项目！