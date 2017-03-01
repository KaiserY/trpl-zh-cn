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

