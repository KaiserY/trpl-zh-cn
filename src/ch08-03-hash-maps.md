## 使用 Hash Map 储存键值对

[ch08-03-hash-maps.md](https://github.com/rust-lang/book/blob/2581c23b669eff30c26e036a13475ec5cf70c1b8/src/ch08-03-hash-maps.md)

最后介绍的常用集合类型是**哈希 map**（*hash map*）。`HashMap<K, V>` 类型储存了一个键类型 `K` 对应一个值类型 `V` 的映射。它通过一个**哈希函数**（*hashing function*）来实现映射，决定如何将键和值放入内存中。很多编程语言支持这种数据结构，不过通常有不同的名字：**哈希**、**map**、**对象**、**哈希表**、**字典**或者**关联数组**，仅举几例。

哈希 map 可以用于需要任何类型作为键来寻找数据的情况，而不是像 vector 那样通过索引。例如，在一个游戏中，你可以将每个团队的分数记录到哈希 map 中，其中键是队伍的名字而值是每个队伍的分数。给出一个队名，就能检索到该队的得分。

本章我们会介绍哈希 map 的基本 API，不过还有更多吸引人的功能隐藏于标准库在 `HashMap<K, V>` 上定义的函数中。一如既往请查看标准库文档来了解更多信息。

### 新建一个哈希 map

可以使用 `new` 创建一个空的 `HashMap`，并使用 `insert` 增加元素。在示例 8-20 中我们记录两支队伍的分数，分别是**蓝队**和**黄队**。蓝队开始有 10 分而黄队开始有 50 分：

```rust
{{#rustdoc_include ../listings/ch08-common-collections/listing-08-20/src/main.rs:here}}
```

<span class="caption">示例 8-20：新建一个哈希 map 并插入一些键值对</span>

注意必须首先 `use` 标准库中集合部分的 `HashMap`。在这三个常用集合中，`HashMap` 是最不常用的，所以并没有被 prelude 自动引用。标准库中对 `HashMap` 的支持也相对较少，例如，并没有内建的构建宏。

像 vector 一样，哈希 map 将它们的数据储存在堆上，这个 `HashMap` 的键类型是 `String` 而值类型是 `i32`。类似于 vector，哈希 map 是同质的：所有的键必须是相同类型，值也必须都是相同类型。

### 访问哈希 map 中的值

可以通过 `get` 方法并提供对应的键来从哈希 map 中获取值，如示例 8-21 所示：

```rust
{{#rustdoc_include ../listings/ch08-common-collections/listing-08-21/src/main.rs:here}}
```

<span class="caption">示例 8-21：访问哈希 map 中储存的蓝队分数</span>

这里，`score` 是与蓝队分数相关的值，应为 `10`。`get` 方法返回 `Option<&V>`，如果某个键在哈希 map 中没有对应的值，`get` 会返回 `None`。程序中通过调用 `copied` 方法来获取一个 `Option<i32>` 而不是 `Option<&i32>`，接着调用 `unwrap_or` 在  `scores` 中没有该键所对应的项时将其设置为零。

可以使用与 vector 类似的方式来遍历哈希 map 中的每一个键值对，也就是 `for` 循环：

```rust
{{#rustdoc_include ../listings/ch08-common-collections/no-listing-03-iterate-over-hashmap/src/main.rs:here}}
```

这会以任意顺序打印出每一个键值对：

```text
Yellow: 50
Blue: 10
```

### 在哈希 map 中管理所有权

对于像 `i32` 这样的实现了 `Copy` trait 的类型，其值可以拷贝进哈希 map。对于像 `String` 这样拥有所有权的值，其值将被移动而哈希 map 会成为这些值的所有者，如示例 8-22 所示：

```rust
{{#rustdoc_include ../listings/ch08-common-collections/listing-08-22/src/main.rs:here}}
```

<span class="caption">示例 8-22：展示一旦键值对被插入后就为哈希 map 所拥有</span>

当 `insert` 调用将 `field_name` 和 `field_value` 移动到哈希 map 中后，将不能使用这两个绑定。

如果我们把对值的引用插入哈希 map，这些值本身并不会被移动进哈希 map。引用所指向的值必须至少在哈希 map 有效的那段时间里一直有效。第十章的[“生命周期确保引用有效”][validating-references-with-lifetimes]部分会更详细地讨论这个问题。

### 更新哈希 map

尽管键值对的数量是可以增长的，每个唯一的键只能同时关联一个值（反之不一定成立：比如蓝队和黄队的 `scores` 哈希 map 中都可能存储有 10 这个值）。

当我们想要改变哈希 map 中的数据时，必须决定如何处理一个键已经有值了的情况。可以选择完全无视旧值并用新值代替旧值。可以选择保留旧值而忽略新值，并只在键**没有**对应值时增加新值。或者可以结合新旧两值。让我们看看这分别该如何实现！

#### 覆盖一个值

如果我们插入了一个键值对，接着用相同的键插入一个不同的值，与这个键相关联的旧值将被替换。即便示例 8-23 中的代码调用了两次 `insert`，哈希 map 也只会包含一个键值对，因为两次都是对蓝队的键插入的值：

```rust
{{#rustdoc_include ../listings/ch08-common-collections/listing-08-23/src/main.rs:here}}
```

<span class="caption">示例 8-23：替换以特定键储存的值</span>

这会打印出 `{"Blue": 25}`。原始的值 `10` 则被覆盖了。

#### 只在键尚不存在时插入键值对

我们经常会检查某个特定的键是否已经在哈希 map 中有对应的值，然后执行如下操作：如果这个键已经存在，就让原来的值保持不变；如果这个键不存在，就插入它和它对应的值。

Hash map 为这种场景提供了一个特殊的 API，叫做 `entry`，它接收你想检查的键作为参数。`entry` 方法的返回值是一个名为 `Entry` 的枚举，它表示一个可能存在、也可能不存在的值。假设我们想检查黄队这个键是否已经有关联的值。如果没有，就插入值 `50`；蓝队也是同样的处理方式。使用 `entry` API 的代码如示例 8-24 所示。

```rust
{{#rustdoc_include ../listings/ch08-common-collections/listing-08-24/src/main.rs:here}}
```

<span class="caption">示例 8-24：使用 `entry` 方法只在键没有对应一个值时插入</span>

`Entry` 上的 `or_insert` 方法被定义为：如果对应 `Entry` 的键已经存在，就返回该值的可变引用；如果不存在，就把参数作为这个键的新值插入，并返回这个新值的可变引用。这比我们自己手写逻辑要清晰得多，而且和借用检查器的配合也更好。

运行示例 8-24 的代码会打印出 `{"Yellow": 50, "Blue": 10}`。第一个 `entry` 调用会插入黄队的键和值 `50`，因为黄队并没有一个值。第二个 `entry` 调用不会改变哈希 map 因为蓝队已经有了值 `10`。

#### 根据旧值更新一个值

另一个常见的哈希 map 的应用场景是找到一个键对应的值并根据旧的值更新它。例如，示例 8-25 中的代码计数一些文本中每一个单词分别出现了多少次。我们使用哈希 map 以单词作为键并递增其值来记录我们遇到过几次这个单词。如果是第一次看到某个单词，就先插入值 `0`。

```rust
{{#rustdoc_include ../listings/ch08-common-collections/listing-08-25/src/main.rs:here}}
```

<span class="caption">示例 8-25：通过哈希 map 储存单词和计数来统计出现次数</span>

这会打印出 `{"world": 2, "hello": 1, "wonderful": 1}`。你可能会看到相同的键值对以不同的顺序打印：回忆一下[“访问哈希 map 中的值”][access]部分中提到遍历哈希 map 会以任意顺序进行。

`split_whitespace` 方法返回一个由空格分隔 `text` 值子 slice 的迭代器。`or_insert` 方法返回这个键的值的一个可变引用（`&mut V`）。这里我们将这个可变引用储存在 `count` 变量中，所以为了赋值必须首先使用星号（`*`）解引用 `count`。这个可变引用在 `for` 循环的结尾离开作用域，这样所有这些改变都是安全的并符合借用规则。

### 哈希函数

`HashMap` 默认使用一种叫做 SipHash 的哈希函数，它可以提供对涉及哈希表[^siphash]的拒绝服务（Denial of Service, DoS）攻击的抵抗能力。不过这不是目前可用的最快哈希算法，但为了更好的安全性而接受一些性能下降，是值得的权衡。如果你分析代码后发现默认哈希函数对你的用途来说太慢，就可以通过指定不同的 hasher 来切换到其他函数。*hasher* 是一种实现了 `BuildHasher` trait 的类型。[第十章][traits]会讨论 trait 以及如何实现它们。你不一定要从零开始自己实现 hasher；[crates.io](https://crates.io/) 上有其他 Rust 用户共享的库，它们提供了许多常见哈希算法的 hasher 实现。

[^siphash]: [https://en.wikipedia.org/wiki/SipHash](https://en.wikipedia.org/wiki/SipHash)

## 总结

vector、字符串和哈希 map 会在你的程序需要储存、访问和修改数据时帮助你。这里有一些你应该能够解决的练习问题：

1. 给定一组整数，使用 vector 并返回这个列表的中位数（排列数组后位于中间的值）和众数（出现次数最多的值；在这里哈希 map 会很有帮助）。
2. 将字符串转换为 pig latin。也就是每一个单词的第一个辅音字母被移动到单词的结尾并增加 *ay*，所以 *first* 会变成 *irst-fay*。元音字母开头的单词则在结尾增加 *hay*（*apple* 会变成 *apple-hay*）。请注意 UTF-8 编码的细节！
3. 使用哈希 map 和 vector，创建一个文本接口来允许用户向公司的部门中增加员工的名字。例如，“Add Sally to Engineering” 或 “Add Amir to Sales”。接着让用户获取一个部门的所有员工的列表，或者公司每个部门的所有员工按照字典序排列的列表。

标准库 API 文档中描述的这些类型的方法将有助于你进行这些练习！

我们已经开始接触可能会有失败操作的复杂程序了，这也意味着接下来是一个了解错误处理的绝佳时机！接下来我们将讨论这一部分！

[validating-references-with-lifetimes]:
ch10-03-lifetime-syntax.html#生命周期确保引用有效
[access]: #访问哈希-map-中的值
[traits]: ch10-02-traits.html
