import _ from 'lodash';
import Field from "./Field";
import FieldRenderer from "./FieldRenderer";

import css from "./css/stylesheet.css";

self.f = new Field(0.5, 2);
f.open(1,1);
//f.centerField(1,1);
f.getAll();
var renderer = new FieldRenderer(f);