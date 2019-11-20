## 哈希 map 储存键值对

> [ch08-03-hash-maps.md](https://github.com/rust-lang/book/blob/master/src/ch08-03-hash-maps.md)
> <br>
> commit 85b02530cc749565c26c05bf1b3a838334e9717f

最后介绍的常用集合类型是 **哈希 map**（*hash map*）。`HashMap<K, V>` 类型储存了一个键类型 `K` 对应一个值类型 `V` 的映射。它通过一个 **哈希函数**（*hashing function*）来实现映射，决定如何将键和值放入内存中。很多编程语言支持这种数据结构，不过通常有不同的名字：哈希、map、对象、哈希表或者关联数组，仅举几例。

哈希 map 可以用于需要任何类型作为键来寻找数据的情况，而不是像 vector 那样通过索引。例如，在一个游戏中，你可以将每个团队的分数记录到哈希 map 中，其中键是队伍的名字而值是每个队伍的分数。给出一个队名，就能得到他们的得分。

本章我们会介绍哈希 map 的基本 API，不过还有更多吸引人的功能隐藏于标准库中 `HashMap<K, V>` 定义的函数中。一如既往请查看标准库文档来了解更多信息。

### 新建一个哈希 map

可以使用 `new` 创建一个空的 `HashMap`，并使用 `insert` 增加元素。在示例 8-20 中我们记录两支队伍的分数，分别是蓝队和黄队。蓝队开始有 10 分而黄队开始有 50 分：

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();

scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);
```

<span class="caption">示例 8-20：新建一个哈希 map 并插入一些键值对</span>

注意必须首先 `use` 标准库中集合部分的 `HashMap`。在这三个常用集合中，`HashMap` 是最不常用的，所以并没有被 prelude 自动引用。标准库中对 `HashMap` 的支持也相对较少，例如，并没有内建的构建宏。

像 vector 一样，哈希 map 将它们的数据储存在堆上，这个 `HashMap` 的键类型是 `String` 而值类型是 `i32`。类似于 vector，哈希 map 是同质的：所有的键必须是相同类型，值也必须都是相同类型。

另一个构建哈希 map 的方法是使用一个元组的 vector 的 `collect` 方法，其中每个元组包含一个键值对。`collect` 方法可以将数据收集进一系列的集合类型，包括 `HashMap`。例如，如果队伍的名字和初始分数分别在两个 vector 中，可以使用 `zip` 方法来创建一个元组的 vector，其中 “Blue” 与 10 是一对，依此类推。接着就可以使用 `collect` 方法将这个元组 vector 转换成一个 `HashMap`，如示例 8-21 所示：

```rust
use std::collections::HashMap;

let teams  = vec![String::from("Blue"), String::from("Yellow")];
let initial_scores = vec![10, 50];

let scores: HashMap<_, _> = teams.iter().zip(initial_scores.iter()).collect();
```

<span class="caption">示例 8-21：用队伍列表和分数列表创建哈希 map</span>

这里 `HashMap<_, _>` 类型注解是必要的，因为可能 `collect` 很多不同的数据结构，而除非显式指定否则 Rust 无从得知你需要的类型。但是对于键和值的类型参数来说，可以使用下划线占位，而 Rust 能够根据 vector 中数据的类型推断出 `HashMap` 所包含的类型。

### 哈希 map 和所有权

对于像 `i32` 这样的实现了 `Copy` trait 的类型，其值可以拷贝进哈希 map。对于像 `String` 这样拥有所有权的值，其值将被移动而哈希 map 会成为这些值的所有者，如示例 8-22 所示：

```rust
use std::collections::HashMap;

let field_name = String::from("Favorite color");
let field_value = String::from("Blue");

let mut map = HashMap::new();
map.insert(field_name, field_value);
// 这里 field_name 和 field_value 不再有效，
// 尝试使用它们看看会出现什么编译错误！
```

<span class="caption">示例 8-22：展示一旦键值对被插入后就为哈希 map 所拥有</span>

当 `insert` 调用将 `field_name` 和 `field_value` 移动到哈希 map 中后，将不能使用这两个绑定。

如果将值的引用插入哈希 map，这些值本身将不会被移动进哈希 map。但是这些引用指向的值必须至少在哈希 map 有效时也是有效的。第十章 [“生命周期与引用有效性”][validating-references-with-lifetimes] 部分将会更多的讨论这个问题。

### 访问哈希 map 中的值

可以通过 `get` 方法并提供对应的键来从哈希 map 中获取值，如示例 8-23 所示：

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();

scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);

let team_name = String::from("Blue");
let score = scores.get(&team_name);
```

<span class="caption">示例 8-23：访问哈希 map 中储存的蓝队分数</span>

这里，`score` 是与蓝队分数相关的值，应为 `Some(10)`。因为 `get` 返回 `Option<V>`，所以结果被装进 `Some`；如果某个键在哈希 map 中没有对应的值，`get` 会返回 `None`。这时就要用某种第六章提到的方法之一来处理 `Option`。

可以使用与 vector 类似的方式来遍历哈希 map 中的每一个键值对，也就是 `for` 循环：

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();

scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);

for (key, value) in &scores {
    println!("{}: {}", key, value);
}
```

这会以任意顺序打印出每一个键值对：

```text
Yellow: 50
Blue: 10
```

### 更新哈希 map

尽管键值对的数量是可以增长的，不过任何时候，每个键只能关联一个值。当我们想要改变哈希 map 中的数据时，必须决定如何处理一个键已经有值了的情况。可以选择完全无视旧值并用新值代替旧值。可以选择保留旧值而忽略新值，并只在键 **没有** 对应值时增加新值。或者可以结合新旧两值。让我们看看这分别该如何处理！

#### 覆盖一个值

如果我们插入了一个键值对，接着用相同的键插入一个不同的值，与这个键相关联的旧值将被替换。即便示例 8-24 中的代码调用了两次 `insert`，哈希 map 也只会包含一个键值对，因为两次都是对蓝队的键插入的值：

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();

scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Blue"), 25);

println!("{:?}", scores);
```

<span class="caption">示例 8-24：替换以特定键储存的值</span>

这会打印出 `{"Blue": 25}`。原始的值 `10` 则被覆盖了。

#### 只在键没有对应值时插入

我们经常会检查某个特定的键是否有值，如果没有就插入一个值。为此哈希 map 有一个特有的 API，叫做 `entry`，它获取我们想要检查的键作为参数。`entry` 函数的返回值是一个枚举，`Entry`，它代表了可能存在也可能不存在的值。比如说我们想要检查黄队的键是否关联了一个值。如果没有，就插入值 50，对于蓝队也是如此。使用 entry API 的代码看起来像示例 8-25 这样：

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();
scores.insert(String::from("Blue"), 10);

scores.entry(String::from("Yellow")).or_insert(50);
scores.entry(String::from("Blue")).or_insert(50);

println!("{:?}", scores);
```

<span class="caption">示例 8-25：使用 `entry` 方法只在键没有对应一个值时插入</span>

`Entry` 的 `or_insert` 方法在键对应的值存在时就返回这个值的 `Entry`，如果不存在则将参数作为新值插入并返回修改过的 `Entry`。这比编写自己的逻辑要简明的多，另外也与借用检查器结合得更好。

运行示例 8-25 的代码会打印出 `{"Yellow": 50, "Blue": 10}`。第一个 `entry` 调用会插入黄队的键和值 `50`，因为黄队并没有一个值。第二个 `entry` 调用不会改变哈希 map 因为蓝队已经有了值 `10`。

#### 根据旧值更新一个值

另一个常见的哈希 map 的应用场景是找到一个键对应的值并根据旧的值更新它。例如，示例 8-26 中的代码计数一些文本中每一个单词分别出现了多少次。我们使用哈希 map 以单词作为键并递增其值来记录我们遇到过几次这个单词。如果是第一次看到某个单词，就插入值 `0`。

```rust
use std::collections::HashMap;

let text = "hello world wonderful world";

let mut map = HashMap::new();

for word in text.split_whitespace() {
    let count = map.entry(word).or_insert(0);
    *count += 1;
}

println!("{:?}", map);
```

<span class="caption">示例 8-26：通过哈希 map 储存单词和计数来统计出现次数</span>

这会打印出 `{"world": 2, "hello": 1, "wonderful": 1}`，`or_insert` 方法事实上会返回这个键的值的一个可变引用（`&mut V`）。这里我们将这个可变引用储存在 `count` 变量中，所以为了赋值必须首先使用星号（`*`）解引用 `count`。这个可变引用在 `for` 循环的结尾离开作用域，这样所有这些改变都是安全的并符合借用规则。

### 哈希函数

`HashMap` 默认使用一种 “密码学安全的”（“cryptographically strong” ）[^siphash] 哈希函数，它可以抵抗拒绝服务（Denial of Service, DoS）攻击。然而这并不是可用的最快的算法，不过为了更高的安全性值得付出一些性能的代价。如果性能监测显示此哈希函数非常慢，以致于你无法接受，你可以指定一个不同的 *hasher* 来切换为其它函数。hasher 是一个实现了 `BuildHasher` trait 的类型。第十章会讨论 trait 和如何实现它们。你并不需要从头开始实现你自己的 hasher；[crates.io](https://crates.io) 有其他人分享的实现了许多常用哈希算法的 hasher 的库。

[^siphash]: [https://www.131002.net/siphash/siphash.pdf](https://www.131002.net/siphash/siphash.pdf)

## 总结

vector、字符串和哈希 map 会在你的程序需要储存、访问和修改数据时帮助你。这里有一些你应该能够解决的练习问题：

* 给定一系列数字，使用 vector 并返回这个列表的平均数（mean, average）、中位数（排列数组后位于中间的值）和众数（mode，出现次数最多的值；这里哈希函数会很有帮助）。
* 将字符串转换为 Pig Latin，也就是每一个单词的第一个辅音字母被移动到单词的结尾并增加 “ay”，所以 “first” 会变成 “irst-fay”。元音字母开头的单词则在结尾增加  “hay”（“apple” 会变成 “apple-hay”）。牢记 UTF-8 编码！
* 使用哈希 map 和 vector，创建一个文本接口来允许用户向公司的部门中增加员工的名字。例如，“Add Sally to Engineering” 或 “Add Amir to Sales”。接着让用户获取一个部门的所有员工的列表，或者公司每个部门的所有员工按照字典序排列的列表。

标准库 API 文档中描述的这些类型的方法将有助于你进行这些练习！

我们已经开始接触可能会有失败操作的复杂程序了，这也意味着接下来是一个了解错误处理的绝佳时机！

[validating-references-with-lifetimes]:
ch10-03-lifetime-syntax.html#validating-references-with-lifetimes