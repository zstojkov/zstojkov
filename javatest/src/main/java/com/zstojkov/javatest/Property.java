package com.zstojkov.javatest;


import java.beans.IntrospectionException;
import java.beans.Introspector;
import java.beans.PropertyDescriptor;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;

public class Property {
	@SuppressWarnings("unchecked")
	public static class PValue<T> {
	    private final Class<T> cls;
		private T value = null;
		public PValue(Class<T> cls) {
			this.cls=cls;
		}
		public PValue(T value) {
			this.cls = (Class<T>)value.getClass();
			this.value=value;
		}
		public void setValue(Object value) {
			System.out.println("setting value: "+(value==null ? "null" : value.toString()));
			this.value=(T)value;
		}

		public void setValue(String str) {
			try {
				if (cls.equals(String.class)) value = (T)str;
				else if (cls.equals(Integer.class)) value = (T)(Object)Integer.parseInt(str);
				else if (cls.equals(Boolean.class)) value = (T)(Object)Boolean.parseBoolean(str);
				else throw new Exception("Property type "+value.getClass().getSimpleName()+" is not supported");
			} catch (Exception e) {
				System.out.println("String can not be parsed to "+(value==null ? "unknown class" : value.getClass().getSimpleName())+" value: "+str);
				e.printStackTrace();
			}
		}
		public T getValue() { return value; }
		public String toString() {return value==null ? "null" : value.toString();}

	}

	enum PR {
		pr1,
		pr2,
		pr3,
		pluginEnabled;
	}

	Map<PR,PValue<?>> map = new HashMap<PR,PValue<?>>();
	{
		map.put(PR.pr1,new PValue<String>("xxxx"));
		map.put(PR.pr2,new PValue<Integer>(3));
		map.put(PR.pr3,new PValue<Integer>(Integer.class));
		map.put(PR.pluginEnabled,new PValue<Boolean>(true));
	}


	public  void test() {
		System.out.println("----------");
		System.out.println(map.get(PR.pr1));
		System.out.println(map.get(PR.pr2));
		System.out.println(map.get(PR.pr3));
		System.out.println(map.get(PR.pluginEnabled));

		map.get(PR.pr1).setValue("abcd");
		map.get(PR.pr2).setValue(5);
		map.get(PR.pr3).setValue("55");
		map.get(PR.pluginEnabled).setValue(false);

		System.out.println(map.get(PR.pr1));
		System.out.println(map.get(PR.pr2));
		System.out.println(map.get(PR.pr3));
		System.out.println(map.get(PR.pluginEnabled));
		map.get(PR.pluginEnabled).setValue("true");
		System.out.println(map.get(PR.pluginEnabled));
		System.out.println("---done---");
	}

	public class SubClass {
		private String str2 = "";
		public String getStr2() {
			return str2;
		}
		public void setStr2(String str2) {
			this.str2 = str2;
		}
	}

	public class MyClass extends SubClass {
		private String str = "";
		private int count = 1;
		private boolean b = true;
		private Integer counto = 1;
		private Boolean bo = true;
		public String getStr() {
			return str;
		}
		public void setStr(String str) {
			this.str = str;
		}
		public int getCount() {
			return count;
		}
		public void setCount(int count) {
			this.count = count;
		}
		public boolean isB() {
			return b;
		}
		public void setB(boolean b) {
			this.b = b;
		}
		public Integer getCounto() {
			return counto;
		}
		public void setCounto(Integer counto) {
			this.counto = counto;
		}
		public Boolean getBo() {
			return bo;
		}
		public void setBo(Boolean bo) {
			this.bo = bo;
		}
	}

	MyClass mc = new MyClass();

	private void setValue(String name, String value) {
		//mc.getClass().getMethod("get"+name.substring(0, 1).toUpperCase()+name.substring(1));
	}

	void test2() throws Exception {
		Object bo = getValue(mc,"bo");
		System.out.println("bo="+bo);
		System.out.println("mc.bo="+mc.getBo());
		setValue(mc,"bo",false);
		System.out.println("mc.bo="+mc.getBo());
		setValue(mc,"bo",null);
		System.out.println("mc.bo="+mc.getBo());
		setValue(mc,"bo","true");
		System.out.println("mc.bo="+mc.getBo());
		setValue(mc,"bo",getValue(mc,"bo"));
		System.out.println("mc.bo="+mc.getBo());
	}

	public Object getValue(Object mc, String prop) {
		try {
			Method getter = getGetter(mc,prop);
			if (getter==null) throw new Exception("Getter not defined for property: "+prop);
			return getter.invoke(mc);
		} catch (Exception e) {
			System.out.println("Failed to get property: "+e.getMessage());
			return false;
		}
	}

	public boolean setValue(Object mc, String prop, Object inputObject) {
		Object value = null;
		try {
			Class<?> cls = getType(mc,prop);
			if (cls==null) throw new Exception("Property not defined: "+prop);
			if (inputObject==null || !inputObject.getClass().equals(String.class)) value = inputObject;
			else try {
				// input object is String
				if (cls.equals(String.class)) value = inputObject;
				else if (cls.equals(Integer.class)) value = Integer.parseInt((String)inputObject);
				else if (cls.equals(Boolean.class)) value = Boolean.parseBoolean((String)inputObject);
				else throw new Exception("Conversion from String to class "+cls.getSimpleName()+" is not supported for property: "+prop);
				} catch (Exception e) {
					throw new Exception("String can not be parsed to class "+value.getClass().getSimpleName()+": "+inputObject);
				}
			Method setter = getSetter(mc,prop);
			if (setter==null) throw new Exception("Setter not defined for property: "+prop);
			setter.invoke(mc, value);
			return true;
		} catch (Exception e) {
			System.out.println("Failed to set property: "+e.getMessage());
			return false;
		}
	}

	Method getSetter (Object mc, String prop) throws IntrospectionException {
        for(PropertyDescriptor pd : Introspector.getBeanInfo(mc.getClass()).getPropertyDescriptors())
        		if (pd.getName().equals(prop)) return pd.getWriteMethod();
        System.out.println("No setter for: "+prop);
        	return null;
	}
	Method getGetter (Object mc, String prop) throws IntrospectionException {
        for(PropertyDescriptor pd : Introspector.getBeanInfo(mc.getClass()).getPropertyDescriptors()) {
        		if (pd.getName().equals(prop)) return pd.getReadMethod();
        }
        System.out.println("No getter for: "+prop);
        	return null;
	}
	Class<?> getType (Object mc, String prop) throws IntrospectionException {
        for(PropertyDescriptor pd : Introspector.getBeanInfo(mc.getClass()).getPropertyDescriptors())
        		if (pd.getName().equals(prop)) return pd.getPropertyType();
        System.out.println("No type for: "+prop);
        	return null;
	}

	/**
	 * Capitalizes the field name unless one of the first two characters are uppercase. This is in accordance with java
	 * bean naming conventions in JavaBeans API spec section 8.8.
	 *
	 * @param fieldName
	 * @return the capitalised field name
	 * @see Introspector#decapitalize(String)
	 */
/*	public static String capatalizeFieldName(String fieldName) {
	    final String result;
	    if (fieldName != null && !fieldName.isEmpty()
	            && Character.isLowerCase(fieldName.charAt(0))
	            && (fieldName.length() == 1 || Character.isLowerCase(fieldName.charAt(1)))) {
	        result = StringUtils.capitalize(fieldName);
	    } else {
	        result = fieldName;
	    }
	    return result;
	}
	*/
}
