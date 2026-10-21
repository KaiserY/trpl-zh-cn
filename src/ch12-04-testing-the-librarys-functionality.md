<a id="developing-the-librarys-functionality-with-test-driven-development"></a>

## 采用测试驱动开发增加功能

[ch12-04-testing-the-librarys-functionality.md](https://github.com/rust-lang/book/blob/1500248d8f230566e4ec9f27fcbb8fe9e2898ab1/src/ch12-04-testing-the-librarys-functionality.md)

现在我们将逻辑提取到了 *src/lib.rs* 并将所有的参数解析和错误处理留在了 *src/main.rs* 中，为代码的核心功能编写测试将更加容易。我们可以直接使用多种参数调用函数并检查返回值而无需从命令行运行二进制文件了。

在这一部分，我们将遵循测试驱动开发（Test Driven Development, TDD）的模式来逐步增加 `minigrep` 的搜索逻辑。它遵循如下步骤：

1. 编写一个失败的测试，并运行它以确保它失败的原因是你所期望的。
2. 编写或修改足够的代码来使新的测试通过。
3. 重构刚刚增加或修改的代码，并确保测试仍然能通过。
4. 从步骤 1 开始重复！

虽然这只是众多编写软件的方法之一，不过 TDD 有助于驱动代码的设计。在编写能使测试通过的代码之前编写测试有助于在开发过程中保持高测试覆盖率。

我们将以测试驱动来实现实际在文件内容中搜索查询字符串并返回匹配行的示例功能。我们将在一个叫做 `search` 的函数中增加这些功能。

### 编写失败测试

我们会像[第十一章][ch11-anatomy]那样，在 *src/lib.rs* 中增加一个 `tests` 模块和一个测试函数。测试函数指定了 `search` 函数期望拥有的行为：它会获取一个需要查询的字符串和用来查询的文本，并只会返回包含请求的文本行。示例 12-15 展示了这个测试：

<span class="filename">文件名：src/lib.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch12-an-io-project/listing-12-15/src/lib.rs:here}}
```

<span class="caption">示例 12-15：创建一个我们期望的 `search` 函数的失败测试</span>

这里选择使用 `"duct"` 作为这个测试中需要搜索的字符串。用来搜索的文本有三行，其中只有一行包含 `"duct"`。（注意双引号之后的反斜杠，这告诉 Rust 不要在字符串字面值内容的开头加入换行符）我们断言 `search` 函数的返回值只包含期望的那一行。

现在运行这个测试，它会失败，因为 `unimplemented!` 宏会以“not implemented”消息触发 panic。根据 TDD 的原则，我们先迈出一小步，加入刚好足够的代码，让函数调用不再 panic：把 `search` 函数定义为总是返回一个空 vector，如示例 12-16 所示。然后这个测试应该能够编译，并因为空 vector 与包含 `"safe, fast, productive."` 这一行的 vector 不匹配而失败。

<span class="filename">文件名：src/lib.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch12-an-io-project/listing-12-16/src/lib.rs:here}}
```

<span class="caption">示例 12-16：为 `search` 函数添加刚好足够的定义，使调用它时不会 panic</span>

注意需要在 `search` 的签名中定义一个显式生命周期 `'a` 并用于 `contents` 参数和返回值。回忆一下[第十章][ch10-lifetimes]中讲到生命周期参数指定哪个参数的生命周期与返回值的生命周期相关联。在这个例子中，我们表明返回的 vector 中应该包含引用参数 `contents`（而不是参数`query`）slice 的字符串 slice。

换句话说，我们告诉 Rust 函数 `search` 返回的数据将与 `search` 函数中的参数 `contents` 的数据存在的一样久。这是非常重要的！为了使这个引用有效那么**被** slice 引用的数据也需要保持有效；如果编译器认为我们是在创建 `query` 而不是 `contents` 的字符串 slice，那么安全检查将是不正确的。

如果我们忘记添加生命周期注解而尝试编译此函数，就会得到如下错误：

```console
{{#include ../listings/ch12-an-io-project/output-only-02-missing-lifetimes/output.txt}}
```

Rust 不可能知道输出需要使用哪一个参数，所以需要显式地告诉它。注意，帮助信息建议为所有参数和输出类型指定相同的生命周期参数，这并不符合我们的意图！因为参数 `contents` 包含了所有的文本而且我们希望返回匹配的那部分文本，所以我们知道 `contents` 是应该要使用生命周期语法来与返回值相关联的参数。

其他语言中并不需要你在函数签名中将参数与返回值相关联。所以这么做可能仍然感觉有些陌生，随着时间的推移这将会变得越来越容易。你可能想要将这个例子与第十章中[“生命周期确保引用有效”][validating-references-with-lifetimes]部分做对比。

### 编写使测试通过的代码

目前测试之所以会失败是因为我们总是返回一个空的 vector。为了修复并实现 `search`，我们的程序需要遵循如下步骤：

1. 遍历内容的每一行文本。
2. 查看这一行是否包含要搜索的字符串。
3. 如果有，将这一行加入列表返回值中。
4. 如果没有，什么也不做。
5. 返回匹配到的结果列表。

让我们一步一步的来，从遍历每行开始。

#### 使用 `lines` 方法逐行遍历

Rust 有一个有助于一行一行遍历字符串的方法，出于方便它被命名为 `lines`，它如示例 12-17 这样工作。注意这还不能编译：

<span class="filename">文件名：src/lib.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch12-an-io-project/listing-12-17/src/lib.rs:here}}
```

<span class="caption">示例 12-17：遍历 `contents` 的每一行</span>

`lines` 方法返回一个迭代器。[第十三章][ch13-iterators]会深入了解迭代器，不过我们已经在[示例 3-5][ch3-iter] 中见过使用迭代器的方法了，在那里使用了一个 `for` 循环和迭代器在一个集合的每一项上运行了一些代码。

#### 用查询字符串搜索每一行

接下来将会增加检查当前行是否包含查询字符串的功能。幸运的是，字符串类型为此也有一个叫做 `contains` 的实用方法！如示例 12-18 所示在 `search` 函数中加入 `contains` 方法调用。注意这仍然不能编译：

<span class="filename">文件名：src/lib.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch12-an-io-project/listing-12-18/src/lib.rs:here}}
```

<span class="caption">示例 12-18：增加检查文本行是否包含 `query` 中字符串的功能</span>

目前，我们正在构建功能。为了让代码能够编译，需要从函数体返回一个我们在函数签名中所声明的值。

#### 存储匹配的行

为了完成这个函数，我们需要一种方法来存储要返回的匹配行。为此可以在 `for` 循环之前创建一个可变的 vector 并调用 `push` 方法在 vector 中存放一个 `line`。在 `for` 循环之后，返回这个 vector，如示例 12-19 所示：

<span class="filename">文件名：src/lib.rs</span>

```rust,ignore
{{#rustdoc_include ../listings/ch12-an-io-project/listing-12-19/src/lib.rs:here}}
```

<span class="caption">示例 12-19：储存匹配的行以便可以返回它们</span>

现在 `search` 函数应该返回只包含 `query` 的那些行，而测试应该会通过。让我们运行测试：

```console
{{#include ../listings/ch12-an-io-project/listing-12-19/output.txt}}
```

测试通过了，我们知道它可以工作了！

现在正是可以考虑重构的时机，在保证测试通过，保持功能不变的前提下重构 `search` 函数。`search` 函数中的代码并不坏，不过并没有利用迭代器的一些实用功能。第十三章将回到这个例子并深入探索迭代器并看看如何改进代码。

现在整个程序应该可以工作了！让我们试一试，首先使用一个只会在艾米莉·狄金森的诗中返回一行的单词 “frog”：

```console
{{#include ../listings/ch12-an-io-project/no-listing-02-using-search-in-run/output.txt}}
```

不错！现在试试一个会匹配多行的单词，比如 “body”：

```console
{{#include ../listings/ch12-an-io-project/output-only-03-multiple-matches/output.txt}}
```

最后，让我们确保搜索一个在诗中哪里都没有的单词时不会得到任何行，比如 *monomorphization*：

```console
{{#include ../listings/ch12-an-io-project/output-only-04-no-matches/output.txt}}
```


非常好！我们创建了一个属于自己的迷你版经典工具，并学习了很多如何组织程序的知识。我们还学习了一些文件输入输出、生命周期、测试和命令行解析的内容。

为了使这个项目更丰满，我们将简要的展示如何处理环境变量和打印到标准错误，这两者在编写命令行程序时都很有用。



[validating-references-with-lifetimes]:
ch10-03-lifetime-syntax.html#生命周期确保引用有效
[ch11-anatomy]: ch11-01-writing-tests.html#精心组织测试函数
[ch10-lifetimes]: ch10-03-lifetime-syntax.html
[ch3-iter]: ch03-05-control-flow.html#使用-for-遍历集合
[ch13-iterators]: ch13-02-iterators.html
